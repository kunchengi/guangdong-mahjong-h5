// src/service/MahjongSceneService.ts
import { Scene, OrthographicCamera, WebGLRenderer, Vector3, Raycaster, Vector2, TextureLoader, PlaneGeometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { MahjongDeckService } from '@/service/MahjongDeckService';
import { Tile } from '@/dao/Tile';

export class MahjongSceneService {
  private scene: Scene;
  private camera: OrthographicCamera;
  private renderer: WebGLRenderer;
  private raycaster: Raycaster = new Raycaster();
  private mouse: Vector2 = new Vector2();
  private selectedObject: Mesh | null = null;

  constructor() {
    // 创建一个新的 Three.js 场景
    this.scene = new Scene();

    // 设置正交相机，确保视图铺满整个屏幕
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 40; // 视锥尺寸，可以根据需要调整
    this.camera = new OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );

    // 设置相机位置，并指向场景中心
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(new Vector3(0, 0, 0));

    // 创建 WebGL 渲染器
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public init(container: HTMLElement) {
    // 将渲染器的 DOM 元素添加到容器中
    container.appendChild(this.renderer.domElement);
    // 为渲染器 DOM 元素添加点击事件监听
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this), false);

    // 创建麻将牌堆，并进行洗牌
    const deckService = new MahjongDeckService();
    const mahjongDeck = deckService.createMahjongDeck();
    deckService.shuffle(mahjongDeck);

    // 分配玩家和对手的初始麻将牌
    const playerTiles = mahjongDeck.slice(0, 13);
    const opponent1Tiles = mahjongDeck.slice(13, 26);
    const opponent2Tiles = mahjongDeck.slice(26, 39);
    const opponent3Tiles = mahjongDeck.slice(39, 52);

    // 创建玩家和对手的麻将牌，并添加到场景中
    this.createPlayerTiles(playerTiles, 0x0000ff, 'current');
    this.createPlayerTiles(opponent1Tiles, 0x00ff00, 'opponent1');
    this.createPlayerTiles(opponent2Tiles, 0xff0000, 'opponent2', true);
    this.createPlayerTiles(opponent3Tiles, 0xffff00, 'opponent3', true);


    // 加载牌桌背景
    this.loadBackground('/images/table-background.jpg');

    // 开始动画循环
    this.animate();
    // 添加窗口大小变化监听事件
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.updateBackgroundSize();
  }

  public cleanup() {
    // 移除窗口大小变化监听事件
    window.removeEventListener('resize', this.onWindowResize.bind(this), false);
    if (this.renderer && this.renderer.domElement) {
      // 移除渲染器 DOM 元素的点击事件监听
      this.renderer.domElement.removeEventListener('click', this.onMouseClick.bind(this), false);
    }
  }

  private onWindowResize() {
    // 更新相机的视锥尺寸，确保场景铺满窗口
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 40;
    this.camera.left = (frustumSize * aspect) / -2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    this.camera.updateProjectionMatrix();


    // 更新渲染器大小
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 更新背景和麻将牌的位置
    this.updateBackgroundSize();
    this.updateMahjongTilesPosition();
  }

  private onMouseClick(event: MouseEvent) {
    // 将鼠标点击位置转换为标准化设备坐标 (NDC)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    // 检查是否点击到当前玩家的麻将牌
    if (intersects.length > 0) {
      const object = intersects[0].object as Mesh;
      if (object.userData.player === 'current') {
        // 如果点击到当前玩家的麻将牌，则将其抬起
        this.scene.children.forEach(child => {
          if ((child as Mesh).userData.player === 'current') {
            (child as Mesh).position.y = this.getOffsetY('current');
          }
        });
        object.position.y += 0.5;
        this.selectedObject = object;
      }
    } else {
      // 如果未点击到麻将牌，重置所有麻将牌的位置
      if (this.selectedObject) {
        this.scene.children.forEach(child => {
          if ((child as Mesh).userData.player === 'current') {
            (child as Mesh).position.y = -10;
          }
        });
        this.selectedObject = null;
      }
    }
  }

  private createMahjongTile(position: Vector3, color: number, player: string, tileData: Tile) {
    // 创建一个麻将牌的几何体和材质
    const geometry = new BoxGeometry(this.getTileWidth(player), this.getTileHeight(player), 1);
    const material = new MeshBasicMaterial({ color });
    const tile = new Mesh(geometry, material);
    tile.position.copy(position);
    tile.userData.player = player;
    tile.userData.tile = tileData;
    // 将麻将牌添加到场景中
    this.scene.add(tile);
  }

  private createPlayerTiles(tiles: Tile[], color: number, player: string, vertical: boolean = false) {

    // 创建一组玩家或对手的麻将牌，并设置其位置
    const offsetX = this.getOffsetX(player, tiles);
    const offsetY = this.getOffsetY(player, tiles);
    const distance = vertical ? this.getTileHeight(player) + Tile.TILE_GAP : this.getTileWidth(player) + Tile.TILE_GAP;
    for (let i = 0; i < tiles.length; i++) {
      const position:Vector3 = vertical ? new Vector3(offsetX, offsetY + i * distance, 0) : 
      new Vector3(offsetX + i * distance, offsetY, 0);
      this.createMahjongTile(position, color, player, tiles[i]);
    }
  }

  private getOffsetX(player: string, tiles: Tile[]): number {
    // 根据玩家和麻将牌数量计算偏移量
    const width = this.getTilesWidth(tiles, player);
    console.log("top" + this.camera.top);
    console.log("bottom" + this.camera.bottom);
    if (player === 'current') {
      return -width / 2 + this.getTileWidth(player) / 2;
    } else if (player === 'opponent1') {
      return -width / 2 + this.getTileWidth(player) / 2;
    } else if (player === 'opponent2') {
      return this.camera.left + this.getTileHeight(player) / 2 + 1 + 20;
    } else if (player === 'opponent3') {
      return this.camera.right - this.getTileHeight(player) / 2 - 1 - 20;
    }
    return 0;
  }

  private getOffsetY(player: string, tiles: Tile[] = []): number {
    const width = this.getTilesWidth(tiles, player);
    // 根据玩家和麻将牌数量计算偏移量
    if (player === 'current') {
      return this.camera.bottom + this.getTileHeight(player) / 2 + 1;
    } else if (player === 'opponent1') {
      return this.camera.top - this.getTileHeight(player) / 2 - 1;
    } else if (player === 'opponent2') {
      return -width / 2 + this.getTileWidth(player) / 2;
    } else if (player === 'opponent3') {
      return -width / 2 + this.getTileWidth(player) / 2;
    }
    return 0;
  }

  private positionTiles(tiles: Mesh[], offsetX: number, offsetY: number, player: string, vertical: boolean = false) {
    // 根据偏移量调整一组麻将牌的位置
    const distance = this.getTileWidth(player) + Tile.TILE_GAP;
    for (let i = 0; i < tiles.length; i++) {
      const position = vertical
        ? new Vector3(offsetX, offsetY + i * distance, 0)
        : new Vector3(offsetX + i * distance, offsetY, 0);
      tiles[i].position.copy(position);
    }
  }

  private loadBackground(imageUrl: string) {
    // 加载背景图像，并设置为场景的背景
    const loader = new TextureLoader();
    loader.load(imageUrl, (texture) => {
      const aspect = window.innerWidth / window.innerHeight;
      const backgroundGeometry = new PlaneGeometry(40 * aspect, 40);
      const backgroundMaterial = new MeshBasicMaterial({ map: texture });
      const backgroundMesh = new Mesh(backgroundGeometry, backgroundMaterial);
      backgroundMesh.position.set(0, 0, -10);
      backgroundMesh.name = 'background';
      this.scene.add(backgroundMesh);

      // 添加窗口大小变化监听事件，用于更新背景尺寸
      window.addEventListener('resize', this.updateBackgroundSize.bind(this), false);
    });
  }

  private updateBackgroundSize() {
    // 根据窗口尺寸更新背景大小
    const backgroundMesh = this.scene.getObjectByName('background') as Mesh;
    if (backgroundMesh) {
      const aspect = window.innerWidth / window.innerHeight;
      backgroundMesh.geometry = new PlaneGeometry(40 * aspect, 40);
    }
  }

  private updateMahjongTilesPosition() {
    // 根据窗口尺寸更新玩家和对手的麻将牌位置
    const playerTiles = this.scene.children.filter(child => (child as Mesh).userData.player === 'current') as Mesh[];
    const opponent1Tiles = this.scene.children.filter(child => (child as Mesh).userData.player === 'opponent1') as Mesh[];
    const opponent2Tiles = this.scene.children.filter(child => (child as Mesh).userData.player === 'opponent2') as Mesh[];
    const opponent3Tiles = this.scene.children.filter(child => (child as Mesh).userData.player === 'opponent3') as Mesh[];

    this.positionTiles(playerTiles, -10, -10, 'current');
    this.positionTiles(opponent1Tiles, -10, 10, 'opponent1');
    this.positionTiles(opponent2Tiles, -20, 0, 'opponent1', true);
    this.positionTiles(opponent3Tiles, 10, 0, 'opponent1', true);
  }

  private animate() {
    // 渲染循环，持续渲染场景
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  private getTilesWidth(tiles: Tile[], player: string): number {
    const len = tiles.length;
    let width = (this.getTileWidth(player) * len) + Tile.TILE_GAP * (len - 1);
    if(player === 'opponent2' || player === 'opponent3')
    {
      width = (this.getTileHeight(player) * len) + Tile.TILE_GAP * (len - 1);
    }
    return width;
  }

  private getTileWidth(player: string): number {
    const scaleValue = player === 'current' ? 1.0 : 0.3;
    // 左右玩家的宽高互换
    if(player === 'opponent2' || player === 'opponent3')
    {
      return Tile.TILE_HEIGHT * scaleValue;
    }
    return Tile.TILE_WIDTH * scaleValue;
  }

  private getTileHeight(player: string): number {
    const scaleValue = player === 'current' ? 1.0 : 0.3;
    // 左右玩家的宽高互换
    if (player === 'opponent2' || player === 'opponent3') {
      return Tile.TILE_WIDTH * scaleValue;
    }
    return Tile.TILE_HEIGHT * scaleValue
  }
}
