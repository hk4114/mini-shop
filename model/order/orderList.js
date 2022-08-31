import { mockIp, mockReqId } from '../../utils/mock';

export function genOrders(params) {
  const resp = {
    data: {
      pageNum: 1,
      pageSize: 10,
      totalCount: 7,
      orders: [
        {
          uid: '88888888205468',
          orderId: '354021735982432279',
          orderNo: '354021731671873099',
          orderType: 0,
          orderSubType: 0,
          orderStatus: 5,
          orderSubStatus: null,
          totalAmount: '10010',
          goodsAmount: '10000',
          goodsAmountApp: '10000',
          paymentAmount: '20',
          freightFee: '10',
          packageFee: '0',
          discountAmount: '9990',
          channelType: 0,
          channelSource: '',
          channelIdentity: '',
          remark: '',
          cancelType: null,
          cancelReasonType: null,
          cancelReason: null,
          rightsType: null,
          createTime: '1600350829291',
          orderItemVOs: [
            {
              id: '354021736133427225',
              orderNo: null,
              spuId: '3',
              skuId: '135696670',
              roomId: null,
              goodsMainType: 0,
              goodsViceType: 0,
              goodsName:
                'goodsName',
              specifications: [],
              goodsPictureUrl:
                'https://cdn-we-retail.ym.tencent.com/tsr/goods/dz-3b.png',
              originPrice: '0',
              actualPrice: '9999',
              buyQuantity: 1,
              itemTotalAmount: '9999',
              itemDiscountAmount: '9990',
              itemPaymentAmount: '10',
              goodsPaymentPrice: '10',
              tagPrice: null,
              tagText: null,
              outCode: null,
              labelVOs: null,
              buttonVOs: null,
            },
          ],
          paymentVO: {
            payStatus: 1,
            amount: '20',
            currency: null,
            payType: null,
            payWay: null,
            payWayName: null,
            interactId: null,
            traceNo: null,
            channelTrxNo: null,
            period: null,
            payTime: null,
            paySuccessTime: null,
          },
          buttonVOs: [
            { primary: false, type: 2, name: '取消订单' },
            { primary: true, type: 1, name: '付款' },
          ],
          labelVOs: null,
          invoiceVO: null,
          autoCancelTime: '1600352629291',
          orderStatusName: '待付款',
          orderSatusRemark: '需支付￥0.20',
          logisticsLogVO: null,
          invoiceStatus: null,
          invoiceDesc: null,
          invoiceUrl: null,
        }
      ],
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 113,
    success: true,
  };
  const { pageNum, pageSize, orderStatus } = params.parameter;
  // 实现筛选
  if (orderStatus > -1) {
    resp.data.orders = resp.data.orders.filter(
      (order) => order.orderStatus === orderStatus,
    );
  }
  // 实现分页
  resp.data.pageNum = pageNum;
  resp.data.pageSize = pageSize;
  resp.data.orders = resp.data.orders.slice(
    (pageNum - 1) * pageSize,
    pageNum * pageSize,
  );
  return resp;
}

export function genOrdersCount() {
  const resp = {
    data: [
      { tabType: 5, orderNum: 1 },
      { tabType: 10, orderNum: 1 },
      { tabType: 40, orderNum: 1 },
      { tabType: 50, orderNum: 2 },
    ],
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 41,
    success: true,
  };
  return resp;
}
