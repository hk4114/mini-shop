import {
  cdnBase
} from '../config/index';
const imgPrefix = cdnBase;

const defaultDesc = [`${imgPrefix}/goods/details-1.png`];

const allGoods = [{
  title: '白色短袖连衣裙荷叶边裙摆宽松韩版休闲纯白清爽优雅连衣裙',
  primaryImage: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
  images: [
    'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
    'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09b.png',
  ],
  desc: '白色短袖连衣裙荷叶边裙摆宽松韩版休闲纯白清爽优雅连衣裙',
  price: 120,
  num: 100,
  unit: '粒',
  descImage: [
    'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09c.png',
    'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09d.png',
  ],
}, ];

/**
 * @param {string} id
 * @param {number} [available] 库存, 默认1
 */
export function genGood(id, available = 1) {
  const specID = ['135681624', '135681628'];
  if (specID.indexOf(id) > -1) {
    return allGoods.filter((good) => good.spuId === id)[0];
  }
  const item = allGoods[id % allGoods.length];
  return {
    ...item,
    spuId: `${id}`,
    available: available,
    desc: item?.desc || defaultDesc,
    images: item?.images || [item?.primaryImage],
    descImage: item.descImage || []
  };
}