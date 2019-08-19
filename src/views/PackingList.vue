<template>

<b-container fluid>
  <h2>PACKING LIST</h2>
  <b-row class="text-center">
    <b-col cols="12">
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="my-table"
        align="center"
        >
      </b-pagination>
    </b-col>
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend">Busqueda</b-input-group-text>
        <b-form-input v-model="search"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>
  <b-tabs class="bg-ligth" pills card>
    <b-tab title="Lista de paquetes">
      <b-table
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
          <b-button @click="deleteOrder(row.item.key, row.item.packingList, row.item.ourOrder, row.item.almacen)"
                    variant="danger" v-if="!disableButtonDelete"><v-icon name="trash-alt"></v-icon></b-button>

          <b-button variant="danger" disabled v-else><v-icon name="trash-alt"></v-icon></b-button>
        </template>

        <template slot="row-details" slot-scope="row">
          <b-row class="my-4">
            <b-col cols="3" offset="3"><b-button variant="primary">Rollos en almacen</b-button></b-col>
            <b-col cols="3">
              <!-- <b-form-checkbox v-model="rollsCheck" :value="row.item">Seleccionar todos</b-form-checkbox> -->
              <b-form-checkbox v-model="rollsCheck" :value="row.item">Seleccionar todos</b-form-checkbox>
            </b-col>
          </b-row>
          <b-table
            :items="row.item.packingList"
            :fields="fieldsRolls"
            striped
            >
            <template slot="kgs" slot-scope="row">
              {{Number(row.item.kgs).toFixed(2)}}
            </template>

            <template slot="seleccionar" slot-scope="row">
              <b-form-checkbox v-model="rollsCheck" :value="row.item.idNumber"></b-form-checkbox>
            </template>
          </b-table>
        </template>
      </b-table>
    </b-tab>
    <b-tab title="Rollos en tránsito" @click="loadRollosEnTransito">
      <b-table :items="rollosEnTransito">
      </b-table>
    </b-tab>
  </b-tabs>
</b-container>
</template>

<script>
import firebase from 'firebase/app'
export default{
  name: 'PackingList',
  mounted(){
    this.db.ref('/order')
      .on('value', snapshot => this.loadData(snapshot.val()))
  },
  computed: {
    disableButtonDelete(){
      let email1 = this.currentUser.email === 'omar.duran@corrugadosaltavista.com'
      let email2 = this.currentUser.email === 'admin@corrougosaltavista.com'
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
        {key: 'idNumber', label: 'Numero de rollo'},
        {key: 'meters', label: 'Metros lineales'},
        'gramaje',
        {key: 'width', label: 'Ancho'},
        {key: 'typePaper', label: 'Tipo de papel'},
        {key: 'kgs', label: 'Kilogramos'},
        {key: 'comments', label: 'Comentario'},
        {key: 'seleccionar', label: 'Seleccionar'}
      ],
      perPage: 20,
      currentPage: 1,
      rollosEnTransito: [],
      rollsCheck: [],
      search: ''

    }
  },
  methods: {
    deleteOrder: function(key, rolls, ourOrder, almacen){
      this.db.ref('/order').child(key).remove()
      rolls.forEach( rol => {
        this.db.ref(almacen).child(rol.key).remove()
      })

      let xls = firebase.storage().ref().child('packing-list/'+key+'.xlsx')
      xls.delete().then( () => {
        console.log('borrado')
      }).catch( (error) => {
        console.log(error)
      })

    },
    loadPackingList: function(data, almacen){
      let arr = []
      data.forEach( element => {
        this.db.ref(almacen).child(element).once('value')
          .then(snapshot => {
            let p = snapshot.val()
            if(p) {
              arr.push({
                'key': element,
                'idNumber': p.idNumber,
                'meters': p.meters,
                'gramaje': p.gramaje,
                'typePaper': p.typePaper,
                'kgs': p.kgs,
                'weight': p.weight,
                'width': `${p.width}\"`,
                'comments': p.comments
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
      }
    },
    loadRollosEnTransito: function(){
      this.rollosEnTransito = []
      this.db.ref('sislocarEnTransito').once('value').then(snap => {
        let roll = snap.val()
        for (let key in roll){
          this.rollosEnTransito.push({
          'idNumber': roll[key].idNumber,
          'kgs': roll[key].kgs,
          'meters': roll[key].meters,
          'gramaje': roll[key].gramaje,
          'width': roll[key].width,
          'typePaper': roll[key].typePaper,
          'comments': roll[key].comments
          })
        }
      })

      this.db.ref('telisaEnTransito').once('value').then( snap => {
        let roll = snap.val()
        for (let key in roll){
          this.rollosEnTransito.push({
          'idNumber': roll[key].idNumber,
          'kgs': roll[key].kgs,
          'meters': roll[key].meters,
          'gramaje': roll[key].gramaje,
          'width': roll[key].width,
          'typePaper': roll[key].typePaper,
          'comments': roll[key].comments
          })
        }
      })

    },
    showRolls: function(row){
      row.toggleDetails()
      this.rollsCheck = []
    }
  }
}
</script>
