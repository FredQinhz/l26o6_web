<script setup lang="ts">

import { request } from "~/utils/request";
import { ElNotification } from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue';
import { h, onMounted, reactive, watch } from "vue";
import { useStationsStore } from "~/stores/stations";
import { parseDate } from "~/utils/date";
import { useRouter } from "vue-router";
import { OrderDetailData } from "~/utils/interfaces";
import { ref } from "vue";
import { Ticket } from "@element-plus/icons-vue/dist/types";

let discountLimit = [0, 1000, 3000, 10000, 50000]
let priceReduction = [0, 1, 4, 18, 118]
let discountPercent = [0.001, 0.0015, 0.002, 0.0025, 0.003]

let innerVisible = ref(false)
let form = reactive({
  usePoint: false,
  payWay: '',
  tickerPrice: 0,
  offset: 0,
})
let points = ref(0)
const getPoints = () => {
  request({
    url: '/user',
    method: 'GET'
  }).then((res) => {
    points.value = res.data.data.mileage_points;

    form.tickerPrice = orderDetail.data.price;

    for (let i = discountLimit.length - 1; i > -1; i--) {
      if (points.value > discountLimit[i]) {
        form.tickerPrice -= priceReduction[i];
        form.tickerPrice -= (points.value - discountLimit[i]) * discountPercent[i];
        if (form.tickerPrice < 0) {
          form.tickerPrice = 0;
        }
        break;
      }
    }
    // form.tickerPrice = Number(form.tickerPrice.toFixed(0));
    form.tickerPrice = Math.floor(form.tickerPrice) //向下取整
    form.offset = orderDetail.data.price - form.tickerPrice;
  }).catch((error) => {
    console.log(error)
  })
}

const router = useRouter()
const stations = useStationsStore()

const props = defineProps({
  id: Number,
})

let orderDetail = reactive<{ data: OrderDetailData }>({
  data: {
    id: 0,
    train_id: 0,
    seat: '',
    status: '',
    created_at: '',
    start_station_id: 0,
    end_station_id: 0,
    departure_time: '',
    arrival_time: '',
    price: 0,
    pay_amount: 0,
    pay_type: '',
  },
})

let train = reactive<{ data: { name?: string } }>({
  data: {}
});

const getOrderDetail = () => {
  request({
    url: `/order/${props.id}`,
    method: 'GET',
  }).then(res => {
    orderDetail.data = res.data.data
    console.log(orderDetail.data)
  }).catch(err => {
    console.log(err)
    if (err.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: 'getOrder错误',
      message: h('i', { style: 'color: teal' }, err.response?.data.msg),
    })
  })
}

const getTrain = () => {
  console.log("getTrain")
  if (orderDetail.data) {
    request({
      url: `/train/${orderDetail.data.train_id}`,
      method: 'GET'
    }).then((res) => {
      train.data = res.data.data
      console.log(train)
    }).catch((error) => {
      ElNotification({
        offset: 70,
        title: 'getTrain错误(orderDetail)',
        message: h('error', { style: 'color: teal' }, error.response?.data.msg),
      })
      console.log(error)
    })
  }
}

const pay = (id: number) => {
  request({
    url: `/order/pay/${id}`,
    method: 'POST',
    data: {
      pay_type: form.payWay,
      use_point: form.usePoint
    }
  }).then((res) => {
    if (form.payWay == '支付宝') {
      document.write(res.data)
    }
    else {
      if (res.data >= 0) {
        openSuccess("微信支付成功！微信账户剩余余额为：" + res.data)
      } else {
        openFail("微信支付失败！微信账户剩余余额不足！")
      }
    }
    getOrderDetail()
    console.log(res)
  }).catch((error) => {
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: '支付失败',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
    console.log(error)
  })
}

const cancel = (id: number) => {
  request({
    url: `/order/cancel/${id}`,
    method: 'POST',
  }).then((res) => {
    ElNotification({
      offset: 70,
      title: '取消成功',
      message: h('success', { style: 'color: teal' }, res.data.msg),
    })
    getOrderDetail()
    console.log(res)
  }).catch((error) => {
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: '取消失败',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
    console.log(error)
  })
}

const refund = (id: number) => {
  request({
    url: `/order/refund/${id}`,
    method: 'GET',
  }).then((res) => {
    openSuccess(res.data)
    getOrderDetail()
    console.log(res)
  }).catch((error) => {
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: '退款失败',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
    console.log(error)
  })
}

const openSuccess = (msg: string) => {
  ElNotification({
    title: 'Success',
    message: msg,
    type: 'success',
  })
}
const openFail = (msg: string) => {
  ElNotification({
    title: 'Error',
    message: msg,
    type: 'error',
  })
}

watch(orderDetail, () => {
  getTrain()
})

onMounted(() => {
  stations.fetch()
  getOrderDetail()
})

getOrderDetail()

</script>

<template>
  <div style="display: flex; flex-direction: column">

    <div style="margin-bottom: 2vh;">
      <el-button style="float:right" @click="getOrderDetail" icon="Refresh">
        刷新
      </el-button>
    </div>

    <div style="display: flex; justify-content: space-between;">
      <div>
        <el-text size="large" tag="b" type="primary">
          订单号:&nbsp;&nbsp;
        </el-text>
        <el-text size="large" tag="b">
          {{ props.id }}
        </el-text>
      </div>
      <div>
        <el-text size="large" tag="b" type="primary">
          创建日期:&nbsp;&nbsp;
        </el-text>
        <el-text size="large" tag="b" v-if="orderDetail.data">
          {{ parseDate(orderDetail.data.created_at) }}
        </el-text>
      </div>
    </div>

    <div>
      <el-text size="large" tag="b" type="primary">
        订单状态:&nbsp;&nbsp;
      </el-text>
      <el-text size="large" tag="b" v-if="orderDetail.data">
        {{ orderDetail.data.status }}
      </el-text>
    </div>
    <div>
      <el-text size="large" tag="b" type="primary">
        车票价格:&nbsp;&nbsp;
      </el-text>
      <el-text size="large" tag="b" v-if="orderDetail.data">
        {{ orderDetail.data.price }}
      </el-text>
    </div>
    <div style="margin-bottom: 2vh"
      v-if="orderDetail.data.status == '已支付' || orderDetail.data.status == '已完成' || orderDetail.data.status == '已退款'">
      <el-text size="large" tag="b" type="primary">
        实付价格:&nbsp;&nbsp;
      </el-text>
      <el-text size="large" tag="b" v-if="orderDetail.data">
        {{ orderDetail.data.pay_amount }}
      </el-text>

      <el-text size="large" tag="b" type="primary">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;支付方式:&nbsp;&nbsp;
      </el-text>
      <el-text size="large" tag="b" v-if="orderDetail.data">
        {{ orderDetail.data.pay_type }}
      </el-text>
    </div>

    <el-descriptions :column="4" border>
      <el-descriptions-item :span="2" width="25%" align="center">
        <template #label>
          <el-text type="primary" tag="b" size="large">
            车次
          </el-text>
        </template>
        <el-text type="primary" tag="b" size="large">
          {{ train?.data?.name }}
        </el-text>
      </el-descriptions-item>
      <el-descriptions-item label="席位信息" :span="2" width="25%" align="center" v-if="orderDetail.data">
        {{ orderDetail.data.seat }}
      </el-descriptions-item>
      <el-descriptions-item label="出发站" :span="2" width="25%" align="center" v-if="orderDetail.data">
        {{ stations.idToName[orderDetail.data.start_station_id] ?? '未知站点' }}
      </el-descriptions-item>
      <el-descriptions-item label="到达站" :span="2" width="25%" align="center" v-if="orderDetail.data">
        {{ stations.idToName[orderDetail.data.end_station_id] ?? '未知站点' }}
      </el-descriptions-item>
      <el-descriptions-item label="出发时间" :span="2" width="25%" align="center" v-if="orderDetail.data">
        {{ parseDate(orderDetail.data.departure_time) }}
      </el-descriptions-item>
      <el-descriptions-item label="到达时间" :span="2" width="25%" align="center" v-if="orderDetail.data">
        {{ parseDate(orderDetail.data.arrival_time) }}
      </el-descriptions-item>
    </el-descriptions>

    <div style="margin-top: 2vh" v-if="orderDetail.data && orderDetail.data.status === '等待支付'">
      <div style="float:right;">
        <el-popconfirm width="220" confirm-button-text="是" cancel-button-text="否" :icon="InfoFilled" icon-color="#ff0000"
          title="您确定要取消订单吗？" @confirm="cancel(id ?? -1)">
          <template #reference>
            <el-button type="danger">
              取消订单
            </el-button></template>
        </el-popconfirm>

        <el-button type="primary" @click="getPoints(); innerVisible = true;">
          支付订单
        </el-button>
      </div>

      <el-dialog destroy-on-close width="45%" title="支付方式" v-model="innerVisible" append-to-body>
        <el-form-item>
          <el-text size="large" tag="b" type="primary">
            车票价格:&nbsp;&nbsp;
          </el-text>
          <el-text size="large" tag="b">
            {{ orderDetail.data.price }}
          </el-text>
          <el-text v-if="form.usePoint" size="large" tag="b"
            type="primary">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;应付价格:&nbsp;&nbsp;</el-text>
          <el-text v-if="form.usePoint" size="large" tag="b">
            {{ form.tickerPrice }}
          </el-text>
        </el-form-item>
        <el-form-item>
          <el-text size="large" tag="b" type="primary">
            当前积分:&nbsp;&nbsp;
          </el-text>
          <el-text size="large" tag="b">
            {{ points }}
          </el-text>
          <el-text v-if="form.usePoint" size="large" tag="b"
            type="primary">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;积分抵价:&nbsp;&nbsp;</el-text>
          <el-text v-if="form.usePoint" size="large" tag="b">
            {{ form.offset }}
          </el-text>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.usePoint"> <el-text size="large" tag="b">
              是否使用积分
            </el-text></el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-radio v-model="form.payWay" label="支付宝" border>
            <img src='../images/ali_pay.png' class="icon-pay">
          </el-radio>
          <el-radio v-model="form.payWay" label="微信" border>
            <img src='../images/wechat_pay1.jpg' class="icon-pay">
          </el-radio>
        </el-form-item>


        <div style=" margin-left: 60vh;">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="pay(id ?? -1)" style=":right;" :disabled="form.payWay == ''">确 定</el-button>
        </div>
      </el-dialog>
    </div>

    <div style="margin-top: 2vh" v-if="orderDetail.data && orderDetail.data.status === '已支付'">
      <div style="float:right;">
        <el-popconfirm width="220" confirm-button-text="是" cancel-button-text="否" :icon="InfoFilled" icon-color="#ff0000"
          title="您确定要退款吗？" @confirm="refund(id ?? -1)">
          <template #reference>
            <el-button type="danger">
              退 款
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<style scoped>
.el-radio .icon-pay {
  height: 20px;
  /* 调整图标大小，根据需要进行调整 */
  width: auto;
  max-width: 100%;
  vertical-align: middle;
  /* 垂直居中对齐 */
  margin-right: 5px;
  /* 调整图标与文字之间的间距，根据需要进行调整 */
}
</style>