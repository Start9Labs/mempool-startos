import { i18n } from './i18n'

type Health = {
  result: 'success' | 'failure' | 'loading'
  message: string
}

/**
 * Reads rbitcoin's `prune` marker: `0` keeps every block's script and witness
 * data, `1` has dropped or will drop it. Anything else is not yet an answer, so
 * it never reports success.
 */
export function rbitcoinArchiveHealth(read: {
  exitCode: number | null
  stdout: string | Buffer
}): Health {
  const marker = read.exitCode === 0 ? String(read.stdout).trim() : null
  if (marker === '0') {
    return {
      result: 'success',
      message: i18n('rbitcoin keeps the full chain history'),
    }
  }
  if (marker === '1') {
    return {
      result: 'failure',
      message: i18n(
        'rbitcoin is pruned. Mempool needs the full chain history: choose another node, or resync rbitcoin without pruning.',
      ),
    }
  }
  return {
    result: 'loading',
    message: i18n('Waiting for rbitcoin to report its storage'),
  }
}
