import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const clearBackendCache = sdk.Action.withoutInput(
  'clear-backend-cache',

  async () => ({
    name: i18n('Clear Backend Cache'),
    description: i18n(
      'Delete the on-disk cache used by the Mempool backend (mempool and RBF data). Use this if the backend fails to start with a JavaScript heap out-of-memory error while loading its cache. The cache is rebuilt from Bitcoin Core and the selected indexer on the next start; you lose only a short mempool resync and recent RBF history, while blocks, database, and settings are untouched. Stop Mempool before running this action.',
    ),
    warning: i18n(
      'This deletes the backend cache. Mempool rebuilds it automatically on the next start.',
    ),
    // Only when stopped: clearing the cache from under a running backend would
    // race its periodic cache writes. Stop -> clear -> start is the safe flow.
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'backend' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'cache',
        subpath: null,
        mountpoint: '/backend/cache',
        readonly: false,
      }),
      'clear-backend-cache',
      async (sub) => {
        // Cache files are written by the root backend daemon, so remove as root.
        await sub.execFail(
          [
            '/bin/sh',
            '-c',
            'rm -rf /backend/cache/* /backend/cache/.[!.]* 2>/dev/null || true',
          ],
          { user: 'root' },
        )
      },
    )

    return {
      version: '1',
      title: i18n('Backend Cache Cleared'),
      message: i18n(
        'The backend cache has been deleted. Start Mempool to rebuild it.',
      ),
      result: null,
    }
  },
)
