<script setup lang="ts">
import { h, reactive, ref, watch } from 'vue'
import { SwitchFilled } from "@element-plus/icons-vue";
import { useStationsStore } from "~/stores/stations";
import { ElNotification } from "element-plus";
import { request } from "~/utils/request";
import { useRouter } from "vue-router";
import { RouteInfo } from '~/utils/interfaces';


const props = defineProps({
  name: String,
  route_id: Number,
  date: String,
  departure_times: Array,
  arrival_times: Array,
  extra_infos: Array,
  train_type: String,
  seat_prices: Array,
  no_seat_max: Number,
  no_seat_sold: Number
})


const router = useRouter()
const stations = useStationsStore()

let train = reactive({
  name: props.name,
  train_type: props.train_type,
  route_id: props.route_id,
  date: props.date,
  departure_times: props.departure_times as Array<string>,
  arrival_times: props.arrival_times as Array<string>,
  extra_infos: props.extra_infos as Array<string>,
  seat_prices: props.seat_prices as Array<number>,
  no_seat_max: props.no_seat_max,
  no_seat_sold: props.no_seat_sold
})

let route = reactive({
  id: 0,
  name: '',
  station_ids: []
})
let routes = ref([] as RouteInfo[])

const getRoutes = () => {
  request({
    url: `/admin/route`,
    method: 'GET'
  }).then((res) => {
    routes.value = res.data.data
  }).catch((error) => {
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: 'getRoutes错误(trainManage)',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
    console.log(error)
  })
  console.log("end")
}

getRoutes()

const getRoute = () => {
  if (train.route_id === undefined) return
  request({
    url: `/admin/route/${train.route_id}`,
    method: 'GET'
  }).then((res) => {
    route.id = res.data.data.id
    route.name = res.data.data.name
    route.station_ids = res.data.data.station_ids
  }).catch((error) => {
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: 'getRoute错误(trainManage)',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
    console.log(error)
  })
}

watch(() => train.route_id, () => {
  train.departure_times = []
  train.arrival_times = []
  train.extra_infos = []
  getRoute()
})
getRoute()

</script>

<template>
  <div>
    <el-row>
      <el-col :span="7">
        <el-form-item>
          <template #label>
            <el-text tag="b" type="primary">
              车次名
            </el-text>
          </template>
          <el-input v-model="train.name" />
        </el-form-item>
      </el-col>
      <el-col :span="7" :offset="1">
        <el-form-item style="display: flex">
          <template #label>
            <el-text tag="b" type="primary">
              车型
            </el-text>
          </template>
          <el-select v-model="train.train_type" style="display: flex; flex-grow: 1">
            <el-option v-for="type in ['高铁', '普通列车']" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="8" :offset="1">
        <el-form-item style="display: flex">
          <template #label>
            <el-text tag="b" type="primary">
              日期
            </el-text>
          </template>
          <el-date-picker v-model="train.date" value-format="YYYY-MM-DD" :clearable="false"
            style="display: flex; flex-grow: 1" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="6">
        <el-form-item>
          <template #label>
            <el-text tag="b" type="primary">
              无座票数量
            </el-text>
          </template>
          <el-input v-model="train.no_seat_max" />
        </el-form-item>
      </el-col>

      <el-col :span="6" :offset="1">
        <el-form-item style="display: flex">
          <template #label>
            <el-text tag="b" type="primary">
              无座票已售
            </el-text>
          </template>
          <el-input v-model="train.no_seat_sold" :disabled="true"></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="8">
        <el-form-item style="display: flex">
          <template #label>
            <el-text tag="b" type="primary">
              票座价格
            </el-text>
          </template>

          <el-text v-if="train.train_type == '高铁'">商务座<el-input v-model="train.seat_prices[0]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '普通列车'">软卧<el-input v-model="train.seat_prices[0]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '高铁'">一等座<el-input v-model="train.seat_prices[1]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '普通列车'">硬卧<el-input v-model="train.seat_prices[1]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '高铁'">二等座<el-input v-model="train.seat_prices[2]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '普通列车'">软座<el-input v-model="train.seat_prices[2]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '高铁'">无座<el-input v-model="train.seat_prices[3]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '普通列车'">硬座<el-input v-model="train.seat_prices[3]"
              placeholder="train.seat_prices[0]"></el-input></el-text>
          <el-text v-if="train.train_type == '普通列车'">无座<el-input v-model="train.seat_prices[4]"
              placeholder="train.seat_prices[0]"></el-input></el-text>

          <!-- <el-select style="display: flex; flex-grow: 1">
            <el-option v-for="price in  train.seat_prices " :key="price" :label="price" :value="price" />
          </el-select> -->

        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <el-form-item>
          <template #label>
            <el-text tag="b" type="primary">
              路线名
            </el-text>
          </template>
          <el-select v-model="train.route_id" style="width: 100%">
            <el-option v-for=" singleRoute  in  routes " :key="singleRoute.id" :label="singleRoute.name"
              :value="singleRoute.id" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <div v-for="( station, index ) in  route.station_ids " :key="station">
      <el-card style="margin-bottom: 0.25%" shadow="hover" class="container">
        <div style="display: flex; align-items: center;">
          <el-icon class="handle" size="large">
            <SwitchFilled />
          </el-icon>
          <strong style="margin-left: 5%; margin-right: 5%">
            {{ index + 1 }}
          </strong>
          <div style="width: 80%">
            {{ stations.idToName[station] }}
          </div>

          <el-date-picker style="width: 50%; margin-right: 1%" :disabled="index === 0"
            @change="() => { if (index === route.station_ids.length - 1) { train.departure_times[index] = train.arrival_times[index] } }"
            v-model="train.arrival_times[index]" type="datetime" placeholder="到点" format="YY/MM/DD HH:mm" />

          <el-date-picker style="width: 50%" :disabled="index === route.station_ids.length - 1"
            @change="() => { if (index === 0) { train.arrival_times[0] = train.departure_times[0] } }"
            v-model="train.departure_times[index]" type="datetime" placeholder="开点" format="YY/MM/DD HH:mm" />
        </div>
      </el-card>
    </div>

    <el-button @click="$emit('formSubmitted', train)" style="margin-top: 2vh" type="primary">
      确认
    </el-button>


    <!--        <pre>-->
    <!--          {{ train.arrival_times }}-->
    <!--          {{train.departure_times }}-->
    <!--        </pre>-->
  </div>
</template>

<style scoped>
.change {
  visibility: hidden
}

.container:hover .change {
  visibility: visible
}
</style>
