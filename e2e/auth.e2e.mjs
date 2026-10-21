/**
 * End-to-end auth flow test.
 *
 * Drives headless Chrome over the DevTools Protocol against a running
 * frontend and backend, and verifies the real user journey: boot, sign in,
 * land on the dashboard, survive a reload, sign out, and get redirected away
 * from a protected route.
 *
 * No test framework and no npm dependencies: the DevTools Protocol is spoken
 * directly over a WebSocket, so the only requirement is Node 22+.
 *
 * Prerequisites (in three terminals):
 *   cd backend && npm run dev      # API on :5000
 *   npm run dev                    # web on :5173
 *
 * Then:
 *   npm run test:e2e
 *
 * Environment overrides:
 *   APP_URL   frontend origin   (default http://localhost:5173)
 *   API_URL   backend origin    (default http://localhost:5000)
 */
import { spawn } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'
const API_URL = process.env.API_URL ?? 'http://localhost:5000'
const DEBUG_PORT = 9222 + Math.floor(Math.random() * 500)
const USER_DATA_DIR = join(tmpdir(), `careerforge-e2e-${Date.now()}`)

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

const findChrome = () => CHROME_CANDIDATES.find((path) => existsSync(path))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Minimal CDP client: enough to navigate, evaluate, and watch the network. */
class DevToolsSession {
  constructor(socket) {
    this.socket = socket
    this.nextId = 0
    this.pending = new Map()
    this.consoleErrors = []
    this.networkFailures = []
    this.apiCalls = []

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)

      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(JSON.stringify(message.error)))
        else resolve(message.result)
        return
      }

      if (message.method === 'Runtime.exceptionThrown') {
        this.consoleErrors.push(
          message.params.exceptionDetails?.exception?.description ?? 'unknown exception',
        )
      }

      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        this.consoleErrors.push(
          message.params.args.map((arg) => arg.value ?? arg.description).join(' '),
        )
      }

      if (message.method === 'Network.loadingFailed') {
        this.networkFailures.push(`${message.params.type} ${message.params.errorText}`)
      }

      if (message.method === 'Network.responseReceived') {
        const { status, url } = message.params.response
        if (url.includes('/api/')) this.apiCalls.push(`${status} ${url}`)
      }
    })
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.nextId
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? 'evaluate failed')
    }
    return result.result.value
  }
}

const results = []
const check = (name, passed, detail = '') => {
  results.push({ name, passed, detail })
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` -> ${detail}` : ''}`)
}

async function connect() {
  const chromePath = findChrome()
  if (!chromePath) {
    throw new Error('No Chrome or Edge binary found. Set CHROME_PATH to override.')
  }

  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  let target = null
  for (let attempt = 0; attempt < 40; attempt++) {
    await sleep(500)
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)
      const targets = await response.json()
      target = targets.find((entry) => entry.type === 'page')
      if (target) break
    } catch {
      // DevTools endpoint is not up yet.
    }
  }

  if (!target) {
    chrome.kill()
    throw new Error('Chrome DevTools endpoint never became available')
  }

  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  const session = new DevToolsSession(socket)
  await session.send('Runtime.enable')
  await session.send('Network.enable')
  await session.send('Page.enable')

  return { session, chrome }
}

/** Fills a React-controlled input, which needs the native value setter. */
const FILL_INPUTS = (email, password) => `(() => {
  const setValue = (element, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
    descriptor.set.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const emailInput = document.querySelector('input[type="email"]')
  const passwordInput = document.querySelector('input[type="password"]')
  if (!emailInput || !passwordInput) throw new Error('login inputs not found')
  setValue(emailInput, ${JSON.stringify(email)})
  setValue(passwordInput, ${JSON.stringify(password)})
  return true
})()`

async function main() {
  const email = `e2e.${Math.random().toString(36).slice(2, 10)}@careerforge.test`
  const password = 'SuperSecret123'

  // The UI only signs in, so the account has to exist first. Sending the
  // Origin header makes the API treat this like a browser request.
  const created = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: APP_URL },
    body: JSON.stringify({ name: 'E2E Tester', email, password, rememberMe: true }),
  })
  check(
    'account can be registered through the API',
    created.status === 201,
    `${created.status}`,
  )

  const { session, chrome } = await connect()

  try {
    // --- 1. the app boots and settles on the login screen -----------------
    await session.send('Page.navigate', { url: `${APP_URL}/login` })

    let login = null
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(500)
      login = await session.evaluate(`(() => ({
        heading: document.querySelector('h1')?.textContent?.trim() ?? null,
        path: location.pathname,
        hasEmail: !!document.querySelector('input[type="email"]'),
      }))()`)
      if (login.hasEmail) break
    }
    check('login page renders', login.heading === 'Welcome back', JSON.stringify(login))
    check('boot check resolves to the login screen', login.path === '/login', login.path)
    check('login form is present', login.hasEmail === true)

    // --- 2. signing in reaches the dashboard ------------------------------
    await session.evaluate(FILL_INPUTS(email, password))
    await session.evaluate(
      `(() => { document.querySelector('form button[type="submit"]').click(); return true })()`,
    )

    let path = '/login'
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(400)
      path = await session.evaluate('location.pathname')
      if (path === '/dashboard') break
    }
    check('login navigates to the dashboard', path === '/dashboard', path)

    // The path changes a beat before the dashboard paints, so poll for the
    // greeting rather than sampling once.
    let dashboard = { hasGreeting: false, greeting: '' }
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(300)
      dashboard = await session.evaluate(`(() => ({
        hasGreeting: /Good (morning|afternoon|evening)/.test(document.body.innerText),
        greeting: document.body.innerText.split('\\n').find((l) => l.startsWith('Good ')) ?? '',
      }))()`)
      if (dashboard.hasGreeting) break
    }
    check('dashboard renders the greeting', dashboard.hasGreeting, dashboard.greeting)

    // --- 3. the session is cookie-backed and survives a reload ------------
    await session.send('Page.reload', { ignoreCache: true })
    let reloaded = { path: '', hasGreeting: false }
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(500)
      reloaded = await session.evaluate(`(() => ({
        path: location.pathname,
        hasGreeting: /Good (morning|afternoon|evening)/.test(document.body.innerText),
      }))()`)
      if (reloaded.hasGreeting) break
    }
    check('session survives a reload', reloaded.path === '/dashboard', reloaded.path)
    check('dashboard still renders after reload', reloaded.hasGreeting === true)

    // --- 4. the profile saves to the API and survives a reload ------------
    await session.send('Page.navigate', { url: `${APP_URL}/settings` })

    let formReady = false
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(500)
      formReady = await session.evaluate(
        `!!document.querySelector('input[autocomplete="name"]')`,
      )
      if (formReady) break
    }
    check('profile form loads', formReady === true)

    // Fill the form by label, so the test does not depend on field order.
    const savedProfile = {
      fullName: 'E2E Tester',
      phone: '+91 98765 43210',
      graduationYear: '2028',
      college: 'Maharaja Surajmal Institute of Technology',
      degree: 'B.Tech Information Technology',
      bio: 'Final year student.',
    }

    await session.evaluate(`(() => {
      const setValue = (element, value) => {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
        descriptor.set.call(element, value)
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
      const field = (label) => {
        const node = [...document.querySelectorAll('label')].find(
          (l) => l.textContent.trim() === label,
        )
        return node ? document.getElementById(node.getAttribute('for')) : null
      }
      const values = ${JSON.stringify({
        'Full Name': savedProfile.fullName,
        Phone: savedProfile.phone,
        'Graduation Year': savedProfile.graduationYear,
        College: savedProfile.college,
        Degree: savedProfile.degree,
      })}
      for (const [label, value] of Object.entries(values)) {
        const target = field(label)
        if (target) setValue(target, value)
      }
      const bio = document.getElementById('profile-bio')
      if (bio) setValue(bio, ${JSON.stringify(savedProfile.bio)})
      return true
    })()`)

    await session.evaluate(`(() => {
      const form = document.querySelector('form')
      form.requestSubmit()
      return true
    })()`)

    let saved = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      saved = await session.evaluate(
        `document.body.innerText.includes('Profile updated successfully.')`,
      )
      if (saved) break
    }
    check('profile saves through the API', saved === true)

    // Reload and confirm the values came back from the database rather than
    // from local state.
    await session.send('Page.reload', { ignoreCache: true })
    let persisted = null
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(500)
      persisted = await session.evaluate(`(() => {
        const field = (label) => {
          const node = [...document.querySelectorAll('label')].find(
            (l) => l.textContent.trim() === label,
          )
          return node ? document.getElementById(node.getAttribute('for')) : null
        }
        return {
          college: field('College')?.value ?? null,
          degree: field('Degree')?.value ?? null,
          year: field('Graduation Year')?.value ?? null,
          phone: field('Phone')?.value ?? null,
        }
      })()`)
      if (persisted?.college) break
    }
    check(
      'profile survives a reload',
      persisted?.college === savedProfile.college &&
        persisted?.degree === savedProfile.degree &&
        persisted?.year === savedProfile.graduationYear &&
        persisted?.phone === savedProfile.phone,
      JSON.stringify(persisted),
    )

    // --- 5. the project portfolio saves to the API -------------------------
    await session.send('Page.navigate', { url: `${APP_URL}/projects` })

    let projectsLoaded = false
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(500)
      projectsLoaded = await session.evaluate(
        `document.body.innerText.includes('Add Project')`,
      )
      if (projectsLoaded) break
    }
    check('projects screen loads', projectsLoaded === true)

    // Open the modal and fill it in.
    await session.evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((b) =>
        b.textContent.trim() === 'Add Project',
      )
      button?.click()
      return true
    })()`)

    let modalOpen = false
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(300)
      modalOpen = await session.evaluate(`!!document.getElementById('project-description')`)
      if (modalOpen) break
    }
    check('project modal opens', modalOpen === true)

    await session.evaluate(`(() => {
      const setValue = (element, value) => {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
        descriptor.set.call(element, value)
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
      const field = (label) => {
        const node = [...document.querySelectorAll('label')].find(
          (l) => l.textContent.trim() === label,
        )
        return node ? document.getElementById(node.getAttribute('for')) : null
      }
      setValue(field('Project Name'), 'E2E Project')
      setValue(document.getElementById('project-description'), 'Created by the end-to-end test.')
      const github = field('GitHub URL')
      if (github) setValue(github, 'https://github.com/example/e2e-project')
      return true
    })()`)

    await session.evaluate(`(() => {
      const form = document.getElementById('project-modal-title')?.closest('form')
      form?.requestSubmit()
      return true
    })()`)

    let projectSaved = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      projectSaved = await session.evaluate(
        `document.body.innerText.includes('E2E Project')`,
      )
      if (projectSaved) break
    }
    check('project saves through the API', projectSaved === true)

    // Reload and confirm it came back from the database.
    await session.send('Page.reload', { ignoreCache: true })
    let projectPersisted = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(500)
      projectPersisted = await session.evaluate(
        `document.body.innerText.includes('E2E Project')`,
      )
      if (projectPersisted) break
    }
    check('project survives a reload', projectPersisted === true)

    // --- 6. the study planner saves to the API ----------------------------
    await session.send('Page.navigate', { url: `${APP_URL}/study` })

    let plannerLoaded = false
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(500)
      plannerLoaded = await session.evaluate(
        `document.body.innerText.includes('Add Task')`,
      )
      if (plannerLoaded) break
    }
    check('study planner loads', plannerLoaded === true)

    await session.evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((b) =>
        b.textContent.trim() === 'Add Task',
      )
      button?.click()
      return true
    })()`)

    let taskModalOpen = false
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(300)
      taskModalOpen = await session.evaluate(`!!document.querySelector('input[type="date"]')`)
      if (taskModalOpen) break
    }
    check('task modal opens', taskModalOpen === true)

    await session.evaluate(`(() => {
      const setValue = (element, value) => {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
        descriptor.set.call(element, value)
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
      const field = (label) => {
        const node = [...document.querySelectorAll('label')].find(
          (l) => l.textContent.trim() === label,
        )
        return node ? document.getElementById(node.getAttribute('for')) : null
      }
      setValue(field('Title'), 'E2E Study Task')
      const due = document.querySelector('input[type="date"]')
      if (due) setValue(due, '2026-12-24')
      return true
    })()`)

    await session.evaluate(`(() => {
      const form = document.querySelector('input[type="date"]')?.closest('form')
      form?.requestSubmit()
      return true
    })()`)

    let taskSaved = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      taskSaved = await session.evaluate(
        `document.body.innerText.includes('E2E Study Task')`,
      )
      if (taskSaved) break
    }
    check('study task saves through the API', taskSaved === true)

    // Toggle it to completed and check the server agrees.
    await session.evaluate(`(() => {
      const toggle = document.querySelector('button[role="checkbox"]')
      toggle?.click()
      return true
    })()`)

    let toggled = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      toggled = await session.evaluate(`(() => {
        const toggle = document.querySelector('button[role="checkbox"]')
        return toggle?.getAttribute('aria-checked') === 'true'
      })()`)
      if (toggled) break
    }
    check('task toggles to completed', toggled === true)

    // Reload and confirm the task and its status came back from the database.
    await session.send('Page.reload', { ignoreCache: true })
    let taskPersisted = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(500)
      taskPersisted = await session.evaluate(`(() => {
        const toggle = document.querySelector('button[role="checkbox"]')
        return (
          document.body.innerText.includes('E2E Study Task') &&
          toggle?.getAttribute('aria-checked') === 'true'
        )
      })()`)
      if (taskPersisted) break
    }
    check('study task and its status survive a reload', taskPersisted === true)

    // --- 7. the DSA tracker saves to the API ------------------------------
    await session.send('Page.navigate', { url: `${APP_URL}/dsa` })

    let dsaLoaded = false
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(500)
      dsaLoaded = await session.evaluate(
        `document.body.innerText.includes('Add Problem')`,
      )
      if (dsaLoaded) break
    }
    check('DSA tracker loads', dsaLoaded === true)

    await session.evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((b) =>
        b.textContent.trim() === 'Add Problem',
      )
      button?.click()
      return true
    })()`)

    let problemModalOpen = false
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(300)
      problemModalOpen = await session.evaluate(
        `!!document.getElementById('add-problem-title')`,
      )
      if (problemModalOpen) break
    }
    check('problem modal opens', problemModalOpen === true)

    const filled = await session.evaluate(`(() => {
      const setValue = (element, value) => {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
        descriptor.set.call(element, value)
        // React maps onChange to 'input' for text inputs and 'change' for
        // selects, so the event has to match the element.
        const eventName = element.tagName === 'SELECT' ? 'change' : 'input'
        element.dispatchEvent(new Event(eventName, { bubbles: true }))
      }
      // Scope the lookup to the dialog: the page behind it has filters with
      // the same labels.
      const dialog = document.getElementById('add-problem-title')?.closest('[role="dialog"]')
      const field = (label) => {
        const node = [...(dialog?.querySelectorAll('label') ?? [])].find(
          (l) => l.textContent.trim() === label,
        )
        return node ? document.getElementById(node.getAttribute('for')) : null
      }
      const missing = []
      for (const [label, value] of [
        ['Title', 'E2E Problem'],
        ['Topic', 'Arrays'],
        ['URL', 'https://leetcode.com/problems/e2e'],
      ]) {
        const target = field(label)
        if (!target) { missing.push(label); continue }
        setValue(target, value)
      }
      return { missing }
    })()`)
    check('problem form fields are found', filled.missing.length === 0, JSON.stringify(filled))

    await session.evaluate(`(() => {
      const form = document.getElementById('add-problem-title')?.closest('form')
      form?.requestSubmit()
      return true
    })()`)

    let problemSaved = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      problemSaved = await session.evaluate(
        `document.body.innerText.includes('E2E Problem')`,
      )
      if (problemSaved) break
    }
    check('problem saves through the API', problemSaved === true)

    // Mark it solved.
    await session.evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find(
        (b) => b.getAttribute('title') === 'Mark as solved',
      )
      button?.click()
      return true
    })()`)

    let markedSolved = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      markedSolved = await session.evaluate(`(() => {
        const button = [...document.querySelectorAll('button')].find(
          (b) => b.getAttribute('title') === 'Mark as unsolved',
        )
        return !!button
      })()`)
      if (markedSolved) break
    }
    check('problem marks as solved', markedSolved === true)

    // Reload and confirm it came back from the database, still solved.
    await session.send('Page.reload', { ignoreCache: true })
    let problemPersisted = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(500)
      problemPersisted = await session.evaluate(`(() => {
        const button = [...document.querySelectorAll('button')].find(
          (b) => b.getAttribute('title') === 'Mark as unsolved',
        )
        return (
          document.body.innerText.includes('E2E Problem') && !!button
        )
      })()`)
      if (problemPersisted) break
    }
    check('problem and its status survive a reload', problemPersisted === true)

    // --- 8. the resume manager saves to the API ---------------------------
    await session.send('Page.navigate', { url: `${APP_URL}/resume` })

    let resumeScreenLoaded = false
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(500)
      resumeScreenLoaded = await session.evaluate(
        `document.body.innerText.includes('Upload Resume')`,
      )
      if (resumeScreenLoaded) break
    }
    check('resume manager loads', resumeScreenLoaded === true)

    // Pick a real file through the real file input. The upload flow only
    // stores metadata, but the file still has to get past the client's
    // extension, MIME type and size checks.
    const resumeFile = join(tmpdir(), 'careerforge-e2e-resume.pdf')
    writeFileSync(resumeFile, '%PDF-1.4\n% careerforge e2e resume\n')

    await session.send('DOM.enable')
    const { root } = await session.send('DOM.getDocument')
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: 'input[type="file"]',
    })
    await session.send('DOM.setFileInputFiles', { files: [resumeFile], nodeId })

    let uploadModalOpen = false
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(300)
      uploadModalOpen = await session.evaluate(
        `!!document.querySelector('input[placeholder="e.g. Software Engineer"], input[type="text"]')`,
      )
      if (uploadModalOpen) break
    }
    check('upload modal opens after picking a file', uploadModalOpen === true)

    await session.evaluate(`(() => {
      const setValue = (element, value) => {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
        descriptor.set.call(element, value)
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
      const field = (label) => {
        const node = [...document.querySelectorAll('label')].find(
          (l) => l.textContent.trim() === label,
        )
        return node ? document.getElementById(node.getAttribute('for')) : null
      }
      const target = field('Target role')
      if (!target) return { ok: false }
      setValue(target, 'Software Engineer')
      return { ok: true }
    })()`)

    await session.evaluate(`(() => {
      const form = document.getElementById('upload-modal-title')?.closest('form')
      form?.requestSubmit()
      return true
    })()`)

    // The modal closing is the signal that the save went through. Checking
    // for the file name alone would also match the modal's own file-name
    // field, which is a false positive when the save fails.
    let resumeSaved = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      resumeSaved = await session.evaluate(`(() => {
        const modalStillOpen = !!document.getElementById('upload-modal-title')
        return (
          !modalStillOpen &&
          document.body.innerText.includes('careerforge-e2e-resume.pdf')
        )
      })()`)
      if (resumeSaved) break
    }
    check('resume saves through the API', resumeSaved === true)

    // Reload and confirm it came back from the database, with its version.
    await session.send('Page.reload', { ignoreCache: true })
    let resumePersisted = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(500)
      resumePersisted = await session.evaluate(
        `document.body.innerText.includes('careerforge-e2e-resume.pdf')`,
      )
      if (resumePersisted) break
    }
    check('resume survives a reload', resumePersisted === true)

    // --- 9. the job board loads from the API ------------------------------
    await session.send('Page.navigate', { url: `${APP_URL}/jobs` })

    // `document.body` is briefly null while the document is being replaced,
    // so every read of the page text goes through this.
    const readBody = `document.body?.innerText ?? ''`

    let boardLoaded = false
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(500)
      boardLoaded = await session.evaluate(
        `Boolean((${readBody}).includes('Jobs & Internships'))`,
      )
      if (boardLoaded) break
    }
    check('job board loads', boardLoaded === true)

    // The count only appears once the fetch lands, so poll for it rather
    // than reading it straight after the heading appears.
    let jobCount = null
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(400)
      jobCount = await session.evaluate(`(() => {
        const match = (${readBody}).match(/Showing\\s+(\\d+)\\s+of\\s+(\\d+)\\s+jobs/)
        if (!match) return null
        return { shown: Number(match[1]), total: Number(match[2]) }
      })()`)
      if (jobCount && jobCount.shown > 0) break
    }
    check(
      'job board shows seeded jobs',
      jobCount !== null && jobCount.shown > 0 && jobCount.total > 0,
      JSON.stringify(jobCount),
    )

    // Filtering happens on the server, so the count has to change.
    const filtered = await session.evaluate(`(() => {
      const select = [...document.querySelectorAll('select')].find((s) =>
        [...s.options].some((o) => o.value === 'CONTRACT'),
      )
      if (!select) return null
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(select),
        'value',
      )
      descriptor.set.call(select, 'CONTRACT')
      select.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    })()`)
    check('job type filter is present', filtered === true)

    let contractOnly = false
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      contractOnly = await session.evaluate(`(() => {
        const match = (${readBody}).match(/Showing\\s+(\\d+)\\s+of\\s+(\\d+)\\s+jobs/)
        if (!match) return false
        return Number(match[1]) > 0 && Number(match[1]) < Number(match[2])
      })()`)
      if (contractOnly) break
    }
    check('filtering by contract narrows the results', contractOnly === true)

    // --- 10. signing out locks the protected routes -----------------------
    // Wait for the sidebar button to exist: on a narrow viewport the sidebar
    // is translated off-screen, and the click would silently do nothing.
    let logoutClicked = false
    for (let attempt = 0; attempt < 20; attempt++) {
      logoutClicked = await session.evaluate(`(() => {
        const button = [...document.querySelectorAll('button')]
          .find((b) => /logout/i.test(b.textContent))
        if (!button) return false
        button.click()
        return true
      })()`)
      if (logoutClicked) break
      await sleep(300)
    }
    check('logout button is reachable', logoutClicked === true)

    await sleep(2000)
    check('logout returns to the login screen', (await session.evaluate('location.pathname')) === '/login')

    await session.send('Page.navigate', { url: `${APP_URL}/dashboard` })
    let guarded = '/dashboard'
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(400)
      guarded = await session.evaluate('location.pathname')
      if (guarded === '/login') break
    }
    check('protected route redirects when signed out', guarded === '/login', guarded)

    // --- 5. nothing went wrong along the way ------------------------------
    check('no console errors', session.consoleErrors.length === 0, session.consoleErrors.join(' | '))
    check(
      'no failed network requests',
      session.networkFailures.length === 0,
      session.networkFailures.join(' | '),
    )
  } finally {
    session.socket.close()
    chrome.kill()
  }

  console.log('\n--- SUMMARY ---')
  const failed = results.filter((entry) => !entry.passed)
  console.log(`${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) {
    for (const entry of failed) console.log(`  - ${entry.name} ${entry.detail}`)
  }
  console.log(`api calls: ${session.apiCalls.join(' | ')}`)

  process.exit(failed.length ? 1 : 0)
}

main().catch((error) => {
  console.error('E2E ERROR:', error)
  process.exit(1)
})
