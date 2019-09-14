<template>

<b-container fluid>
  <h2>PACKING LIST</h2>

  <b-tabs class="bg-light" pills card>
    <b-tab title="Lista de paquetes">
      <b-container fluid>
        <b-row>
          <b-col cols="4" offset="2">
            <b-input-group>
              <b-input-group-text slot="prepend">Busqueda</b-input-group-text>
              <b-form-input v-model="search"></b-form-input>
            </b-input-group>
          </b-col>
          <b-col cols="4">
            <b-pagination
              v-model="currentPage"
              :total-rows="rows"
              :per-page="perPage"
              aria-controls="my-table"
              align="center"
              >
            </b-pagination>
          </b-col>
        </b-row>
      </b-container>
      <b-table
        class="pt-4"
        :items="order"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        :filter="search"
        head-variant="dark"
        responsive
        >
        <template slot="download" slot-scope="row">
          <a class="btn btn-primary" :href="row.item.download"><v-icon name="download"></v-icon></a>
        </template>

        <template slot="rolls" slot-scope="row">
          <b-button @click.stop="showRolls(row)"><v-icon name="expand-arrows-alt"></v-icon></b-button>
        </template>

        <template slot="delete" slot-scope="row">
          <b-button @click="setModalDeleteOrder(row.item)"
                    variant="danger" v-if="!disableButtonDelete"><v-icon name="trash-alt"></v-icon></b-button>

          <b-button variant="danger" disabled v-else><v-icon name="trash-alt"></v-icon></b-button>
        </template>

        <template slot="row-details" slot-scope="row">

          <b-table
            :items="row.item.packingList"
            :fields="fieldsRolls"
            head-variant="dark"
            >
            <template slot="kgs" slot-scope="row">
              {{(Math.round(row.item.kgs)).toLocaleString('en-us')}}
            </template>
            <template slot="meters" slot-scope="row">
              {{(Math.round(row.item.meters)).toLocaleString('en-us')}}
            </template>
            <template slot="enTransito" slot-scope="row">

              <label v-if="row.item.enTransito && !row.item.comentarioNoLlego">Sí</label>
              <label v-if="!row.item.enTransito && row.item.comentarioNoLlego">{{row.item.comentarioNoLlego}}</label>
              <label v-if="!row.item.enTransito && !row.item.comentarioNoLlego">Registrado en almacen</label>
            </template>
          </b-table>

        </template>
      </b-table>
    </b-tab>
    <b-tab title="Rollos en tránsito">
      <rolls-in-transit :rollosEnTransito="rollosEnTransito"></rolls-in-transit>

    </b-tab>
  </b-tabs>
  <b-modal v-model="showModalDeleteOrder"
           hide-header
           hide-footer
           no-close-on-backdrop
           >
    <b-container  class="text-center">
      <b-row>
        <b-col>
          <h3>¿Esta seguro de eliminar el packing list?</h3>
        </b-col>
      </b-row>
      <b-row class="pt-4">
        <b-col>
          <b-button block variant="danger" class="mr-2" @click="showModalDeleteOrder = false">No</b-button>
          <b-button block variant="primary" class="mr-2" @click="deleteOrder()" :disabled="spinnerDelete">
            <label for="" v-if="!spinnerDelete">Si</label>
            <b-spinner variant="white" v-else></b-spinner>
          </b-button>

      </b-col>
    </b-row>
  </b-container>
</b-modal>
</b-container>
</template>

<script>
import firebase from 'firebase/app'
import RollsInTransit from '@/components/RollsInTransit'

export default{
  name: 'PackingList',
  mounted(){
    this.db.ref('/order')
      .on('value', snapshot => this.loadData(snapshot.val()))
    this.loadRollosEnTransito()
  },
  components: {
    RollsInTransit
  },
  computed: {
    countSelectRolls(){
      return this.rollsCheck.length + this.rollsNotCheck.length
    },
    disableButtonDelete(){
      let email1 = this.currentUser.email === 'omar.duran@corrugadosaltavista.com'
      let email2 = this.currentUser.email === 'admin@corrugadosaltavista.com'
      if ( email1 || email2 ) {
        return false
      }
      else return true
    },
    rows() {
      return this.order.length
    }
  },
  data(){
    return{
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      order: [],
      provided: '',
      date: '',
      shipped: '',
      shipment: '',
      carrier: '',
      vehicle: '',
      booking: '',
      comment: '',
      ourOrder: '',
      yourOrder: '',
      fields: ['provided', 'date', 'shipped', 'shipment', 'carrier', 'vehicle',
               'booking', 'comment', 'ourOrder', 'yourOrder', 'almacen', 'download', 'rolls', 'delete'],
      fieldsRolls: [
        {key: 'typePaper', label: 'Tipo de papel'},
        {key: 'idNumber', label: 'Numero de rollo'},
        'gramaje',
        {key: 'width', label: 'Ancho'},
        {key: 'kgs', label: 'Kilogramos'},
        {key: 'meters', label: 'Metros lineales'},
        'enTransito',
        {key: 'comments', label: 'Comentario'},
      ],
      perPage: 20,
      currentPage: 1,
      rollosEnTransito: [],
      search: '',
      showModalDeleteOrder: false,
      orderDelete: '',
      spinnerDelete: false
    }
  },
  methods: {
    setModalDeleteOrder: function(order){
      this.spinnerDelete = false
      this.showModalDeleteOrder = true
      this.orderDelete = order
    },
    changeApply: function(change, ubication, rolls){
      let d = new Date()
      let month = '' + (d.getMonth() + 1)
      let day = '' + d.getDate()
      let year = d.getFullYear()

      let hour = d.getHours()
      let minutes = d.getMinutes()
      let seconds = d.getSeconds()
      let tz = hour < 12 ? ' am.' : ' pm.'

      rolls.forEach( r => {
        let changeObj = {

          cambioRealizado: change,
          fecha: day + '-' + month + '-' + year,
          hora: hour + ':' + minutes + ':' + seconds + tz,
          numRollo: r.idNumber,
          nota: '',
          ubicacion: ubication,
          usuario: this.currentUser.email,

        }
        let key = this.db.ref('CambiosRealizados').push().key

        this.db.ref('CambiosRealizados').child(key).set(changeObj).then(data => {
          console.log('cambio realizado')
        }).catch( error => {
          console.log(error + ' al cambiar')
        })

      })
    },
    deleteOrder: function(){
      this.spinnerDelete = true
      let key = this.orderDelete.key
      let rolls = this.orderDelete.packingList
      let almacen = this.orderDelete.almacen

      this.db.ref('/order').child(key).remove()


      let xls = firebase.storage().ref().child('packing-list/'+key+'.xlsx')
      xls.delete().then( () => {
        let i = 0
        rolls.forEach( rol => {

          this.db.ref(almacen+'EnTransito').child(rol.key).remove().then( ()=> {
            i++
            if(i === rolls.length) {
              this.showModalDeleteOrder = false
              this.changeApply('Rollo borrado desde packing list', 'En transito', rolls)
            }

          }).catch( error => {
            console.log('error')
          })
        })

        console.log('borrado')
      }).catch( (error) => {
        console.log(error)
      })

    },
    // deleteOrder: function(key, rolls, ourOrder, almacen){
    //   this.db.ref('/order').child(key).remove()
    //   rolls.forEach( rol => {
    //     this.db.ref(almacen+'EnTransito').child(rol.key).remove()
    //   })

    //   let xls = firebase.storage().ref().child('packing-list/'+key+'.xlsx')
    //   xls.delete().then( () => {
    //     console.log('borrado')
    //   }).catch( (error) => {
    //     console.log(error)
    //   })

    // },
    loadPackingList: function(data, almacen){
      let arr = []
      data.forEach( element => {
        this.db.ref(almacen+'EnTransito').child(element).once('value')
          .then(snapshot => {
            let p = snapshot.val()
            if(p) {
              let rowv = 'danger'
              if (!p.enTransito && (typeof p.comentarioNoLlego === 'undefined')){
                rowv = 'primary'
              }else if(!p.enTransito && (typeof p.comentarioNoLlego !== 'undefined')){
                rowv = 'red-custom'
              }
              // let rowv = p.enTransito === true ? 'danger' : 'primary'
              arr.push({
                'key': element,
                'idNumber': p.idNumber,
                'fecha': p.fecha,
                'meters': p.meters,
                'gramaje': p.gramaje,
                'typePaper': p.typePaper,
                'kgs': p.kgs,
                'weight': p.weight,
                'width': p.width,
                'comments': p.comments,
                'enTransito': p.enTransito,
                'almacen': almacen,
                '_rowVariant': rowv,
                'comentarioNoLlego': p.comentarioNoLlego,
                'dua': p.dua
              })
            }

          })
      })
      return arr
    },
    loadData: function(data){
      this.order = []
      for (let key in data){
        this.order.push({
          'key': key,
          'provided': data[key].provided,
          'date': data[key].date,
          'shipment': data[key].shipment,
          'carrier': data[key].carrier,
          'vehicle': data[key].vehicle,
          'booking': data[key].booking,
          'comment': data[key].comment,
          'shipped': data[key].shipped,
          'ourOrder': data[key].ourOrder,
          'yourOrder': data[key].yourOrder,
          'almacen': data[key].almacen,
          'download': data[key].downloadXLS,
          'packingList': this.loadPackingList(data[key]['packing-list'], data[key].almacen)
        })
      }                         //
    },
    loadRollosEnTransito: function(){
      this.rollosEnTransito = []
      this.db.ref('sislocarEnTransito').once('value').then(snap => {
        let roll = snap.val()
        for (let key in roll){
          if(typeof roll[key].idNumber === 'undefined') console.log(key)
          this.rollosEnTransito.push({
            'idNumber': roll[key].idNumber.toString(),
            'fecha': roll[key].fecha,
            'kgs': roll[key].kgs,
            'meters': roll[key].meters,
            'gramaje': roll[key].gramaje.toString(),
            'width': roll[key].width,
            'typePaper': roll[key].typePaper,
            'comments': roll[key].comments,
            'enTransito': roll[key].enTransito,
            'almacen': 'sislocar',
            'comentarioNoLlego': roll[key].comentarioNoLlego
          })
        }
      })

      this.db.ref('telisaEnTransito').once('value').then( snap => {
        let roll = snap.val()
        for (let key in roll){
          this.rollosEnTransito.push({
            'idNumber': roll[key].idNumber.toString(),
            'kgs': roll[key].kgs,
            'meters': roll[key].meters,
            'gramaje': (roll[key].gramaje).toString(),
            'fecha': roll[key].fecha,
            'width': roll[key].width,
            'typePaper': roll[key].typePaper,
            'comments': roll[key].comments,
            'enTransito': roll[key].enTransito,
            'almacen': 'telisa',
            'comentarioNoLlego': roll[key].comentarioNoLlego
          })
        }
      })

    },
    // selectAll: function(packingList){
    //   this.rollsCheck = []
    //   if(!this.rollsCheckAll){
    //     packingList.forEach( roll => {
    //       roll.enTransito ? this.rollsCheck.push(roll) : null
    //     })
    //   }
    // },
    showRolls: function(row){
      row.toggleDetails()
      // if (this.rollsCheck.length > 0) {
      //   this.containsSelectedRolls = true
      //   console.log('Tiene seleccionados')
      // }else{
      //   row.toggleDetails()
      // }
      // this.rollsCheck = []

    }
  }

}
</script>
