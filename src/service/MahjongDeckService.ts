// src/service/MahjongDeckService.ts
import { Tile } from '@/dao/Tile';

/**
 * 处理麻将牌堆操作的类
 */
export class MahjongDeckService {

  /**
   * 创建标准的麻将牌堆
   * @returns {Tile[]} 一组麻将牌
   */
  public createMahjongDeck(): Tile[] {
    const tiles: Tile[] = [];

    // 创建筒、条、万的牌 (1-9，每种牌4张)
    for (let suit = 1; suit <= 3; suit++) {
      for (let value = 1; value <= 9; value++) {
        for (let i = 0; i < 4; i++) {
          tiles.push(new Tile(suit, value));
        }
      }
    }

    // 创建字牌 (东南西北中发白，每种牌4张)
    for (let honor = 1; honor <= 7; honor++) {
      for (let i = 0; i < 4; i++) {
        tiles.push(new Tile(4, honor));
      }
    }

    return tiles;
  }

  /**
   * 洗牌算法
   * @param {Tile[]} array - 需要洗的牌堆
   */
  public shuffle(array: Tile[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
