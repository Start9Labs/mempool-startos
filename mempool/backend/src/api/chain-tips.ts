import logger from '../logger';
import bitcoinClient from './bitcoin/bitcoin-client';

export interface ChainTip {
  height: number;
  hash: string;
  branchlen: number;
  status: 'invalid' | 'active' | 'valid-fork' | 'valid-headers' | 'headers-only';
};

export interface OrphanedBlock {
  height: number;
  hash: string;
  status: 'valid-fork' | 'valid-headers' | 'headers-only';
}

class ChainTips {
  private chainTips: ChainTip[] = [];
  private orphanedBlocks: OrphanedBlock[] = [];

  public async updateOrphanedBlocks(): Promise<void> {
    try {
      this.chainTips = await bitcoinClient.getChainTips();
      this.orphanedBlocks = [];

      for (const chain of this.chainTips) {
        if (chain.status === 'valid-fork' || chain.status === 'valid-headers') {
          let block = await bitcoinClient.getBlock(chain.hash);
          while (block && block.confirmations === -1) {
            this.orphanedBlocks.push({
              height: block.height,
              hash: block.hash,
              status: chain.status
            });
            block = await bitcoinClient.getBlock(block.previousblockhash);
          }
        }
      }

      logger.debug(`Updated orphaned blocks cache. Found ${this.orphanedBlocks.length} orphaned blocks`);
    } catch (e) {
      logger.err(`Cannot get fetch orphaned blocks. Reason: ${e instanceof Error ? e.message : e}`);
    }
  }

  public getOrphanedBlocksAtHeight(height: number | undefined): OrphanedBlock[] {
    if (height === undefined) {
      return [];
    }

    const orphans: OrphanedBlock[] = [];
    for (const block of this.orphanedBlocks) {
      if (block.height === height) {
        orphans.push(block);
      }
    }
    return orphans;
  }
}

export default new ChainTips();