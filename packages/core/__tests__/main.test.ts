import { fixture } from './helper'
import PacyCore from '../src'

describe('PacyCore', function () {
  it('spec case', async function () {
    const core = new PacyCore({ cwd: fixture('rc') })
    await core.run()
  })
})
