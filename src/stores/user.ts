import { defineStore } from "pinia";
import { request } from "~/utils/request";

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            user_type: '',
            username: '',
            name: '',
            type: '',
            idn: '',
            phone: '',
            mileage_points: ''
        }
    },
    getters: {
        getUserName() {

        }
    },
    actions: {
        fetch() {
            request({
                url: '/user',
                method: 'GET'
            }).then((res) => {
                this.user_type = res.data.data.user_type;
                this.username = res.data.data.username;
                this.name = res.data.data.name;
                this.type = res.data.data.type;
                this.idn = res.data.data.idn;
                this.phone = res.data.data.phone;
                this.mileage_points = res.data.data.mileage_points;
            }).catch((err) => {
                console.log(err)
            })
        }
    }

})