// src/dao/Tile.ts

/**
 * 表示一张麻将牌的类
 */
export class Tile {
  public static readonly TILE_WIDTH = 4; // 麻将牌的宽度
  public static readonly TILE_HEIGHT = 6; // 麻将牌的高度
  public static readonly TILE_GAP = 0.2; // 麻将牌的间隙
  public suit: number; // 花色 (1-3 表示筒、条、万；4 表示字牌)
  public value: number; // 牌的值 (1-9 表示筒、条、万；1-7 表示字牌)

  /**
   * 创建一张麻将牌
   * @param {number} suit - 牌的花色
   * @param {number} value - 牌的值
   */
  constructor(suit: number, value: number) {
    this.suit = suit;
    this.value = value;
  }
}
