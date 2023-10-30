<script setup lang="ts">

import { h, onMounted, reactive, ref } from "vue";
import { request } from "~/utils/request";
import { ElMessage, ElNotification } from "element-plus";
import { useStationsStore } from "~/stores/stations";
import TrainManageDetail from "~/components/TrainManageDetail.vue";
import TrainManageForm from "~/components/TrainManageForm.vue";
import { useRouter } from "vue-router";
import { TrainInfo } from "~/utils/interfaces";
import { InfoFilled } from '@element-plus/icons-vue';

const router = useRouter()
const stations = useStationsStore()

let trainName = ref('')
let trains = [] as TrainInfo[];
let trainsFiltered = reactive({
  data: [] as TrainInfo[],
})

let toAdd = reactive({
  name: '',
  route_id: undefined,
  date: '',
  train_type: '',
  departure_times: [],
  arrival_times: [],
  extra_infos: [],
  seat_prices: [],
  no_seat_max: 0
})

let toChange: TrainInfo = reactive({
  id: 0,
  name: '',
  route_id: 0,
  train_type: '',
  date: '',
  departure_times: [],
  arrival_times: [],
  extra_infos: [],
  seat_prices: [],
  no_seat_max: 0,
  no_seat_sold: 0
})

let add = ref(false)
let change = ref(false)

const addTrain = (train: TrainInfo) => {
  if (train.route_id ===
    undefined) {
    ElMessage({
      message: '路线不能为空',
      type: 'error',
    })
    return
  }
  request({
    url: '/admin/train',
    method: 'POST',
    data: {
      name: train.name,
      route_id: train.route_id,
      date: train.date,
      departure_times: train.departure_times,
      arrival_times: train.arrival_times,
      extra_infos: train.extra_infos,
      train_type: train.train_type,
      seat_prices: train.seat_prices,
      no_seat_max: train.no_seat_max
    }
  }).then((res) => {
    ElNotification({
      offset: 70,
      title: '成功',
      message: h('success', { style: 'color: teal' }, res.data.msg),
    })
    add.value = false
    trainName.value = ''
    refreshData()
    filter()
  }).catch((error) => {
    console.log(error)
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: 'postTrain错误',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
  })
}

const delTrain = (id: number) => {
  request({
    url: `/admin/train/${id}`,
    method: 'DELETE'
  }).then((res) => {
    ElNotification({
      offset: 70,
      title: '成功',
      message: h('success', { style: 'color: teal' }, res.data.msg),
    })
    trainName.value = ''
    refreshData()
    filter()
  }).catch((error) => {
    console.log(error)
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: 'deleteTrain错误',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
  })
}

const changeTrain = (train: TrainInfo) => {
  request({
    url: `/admin/train/${toChange.id}`,
    method: 'PUT',
    data: {
      name: train.name,
      route_id: train.route_id,
      date: train.date,
      departure_times: train.departure_times,
      arrival_times: train.arrival_times,
      extra_infos: train.extra_infos,
      train_type: train.train_type,
      seat_prices: train.seat_prices,
      no_seat_max: train.no_seat_max,
      no_seat_sold: train.no_seat_sold
    }
  }).then((res) => {
    ElNotification({
      offset: 70,
      title: '成功',
      message: h('success', { style: 'color: teal' }, res.data.msg),
    })

    change.value = false
    trainName.value = ''
    refreshData()
    filter()
  }).catch((error) => {
    console.log(error)
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: 'putTrain错误',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
  })
}

const refreshData = () => {
  stations.fetch()
  request({
    url: '/admin/train',
    method: 'GET'
  }).then((res) => {
    trains = res.data.data
    trainsFiltered.data = [...trains]
  }).catch((error) => {
    console.log(error)
    if (error.response?.data.code == 100003) {
      router.push('/login')
    }
    ElNotification({
      offset: 70,
      title: 'getTrain错误',
      message: h('error', { style: 'color: teal' }, error.response?.data.msg),
    })
  })
}

const filter = () => {
  trainsFiltered.data = trains.filter((train) => {
    return train.name.includes(trainName.value)
  })
}

// for debug
// const seeTrain = () => {  
//   alert(JSON.stringify(trainsFiltered.data))
// }

onMounted(() => {
  refreshData()
})
</script>

<template>
  <el-container>
    <el-header style="position: fixed; width: 100%; z-index: 999">
      <MenuComponent pageIndex="/train" />
    </el-header>
    <el-main style="margin-top: 8vh">
      <div style="display: flex; justify-content: center">
        <el-card shadow="hover" style="width: 70vh; height: auto; ">
          <el-form inline style="display: flex; " @submit.native.prevent>
            <el-form-item label="车次名" style="display: flex; flex-grow: 1">
              <el-input v-model="trainName" autofocus @keyup.enter.native="filter" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="filter" icon="Search">
                查询
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <br />
      <br />

      <div style="display: flex; justify-content: center">
        <div style="display: flex; width: 80vh; justify-content: flex-end">
          <el-space>
            <el-button type="primary" @click="add = true" icon="Plus">
              添加
            </el-button>
          </el-space>
        </div>
      </div>

      <br />
      <br />

      <div style="display: flex; justify-content: center">
        <el-collapse style="width: 80vh; display: flex;flex-direction: column;">
          <el-collapse-item v-for="train in trainsFiltered.data" :title="train.name">
            <div style="margin-bottom: 5%">
              <el-button @click="change = true; toChange = train;">
                更改
              </el-button>
              <el-popconfirm width="220" confirm-button-text="是" cancel-button-text="否" :icon="InfoFilled"
                icon-color="#ff0000" title="您确定要删除该列车吗？" @confirm="delTrain(train.id)">
                <template #reference>
                  <el-button type="danger">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
            <div>
              <TrainManageDetail v-bind="{ ...train, date: new Date(train.date) }" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-main>
  </el-container>

  <el-dialog v-model="change" title="更改车次" width="60%" draggable>
    <div>请输入更改后的车次信息</div>
    <br />
    <div>
      <TrainManageForm v-bind="toChange" @formSubmitted="changeTrain" :key="toChange.id" />
    </div>
  </el-dialog>

  <el-dialog v-model="add" title="添加车次" width="60%" draggable destroy-on-close>
    <div>请输入新的车次信息</div>
    <br />
    <div>
      <TrainManageForm v-bind="toAdd" @formSubmitted="addTrain" />
    </div>
  </el-dialog>

  <!-- for debug -->
  <!-- <el-button @click="seeTrain">查看车辆详情属性</el-button> -->
</template>

<style scoped></style>