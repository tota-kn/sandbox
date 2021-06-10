import axios from 'axios'
import { RootObject } from './@types/get'

axios
    .get<RootObject>('https://randomuser.me/api?callback=jsonData')
    .then((res) => {
        console.log(res.data)
    })
    .catch((e) => {
        console.log(e)
    })

  console.log('aaaa')
  console.log('aaaa')