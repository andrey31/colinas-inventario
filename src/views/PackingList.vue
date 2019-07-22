<template>

<b-container fluid>
  <h2>PACKING LIST</h2>
  <b-table
    :items="order"
    :fields="fields"
    :filter="filter"
    head-variant="dark"
    responsive
    >
    <template slot="download" slot-scope="row">
      <a class="btn btn-primary" :href="row.item.download"><v-icon name="download"></v-icon></a>
    </template>

    <template slot="rolls" slot-scope="row">
      <b-button @click.stop="row.toggleDetails"><v-icon name="expand-arrows-alt"></v-icon></b-button>
    </template>

    <template slot="delete" slot-scope="row">
      <b-button @click="deleteOrder(row.item.key, row.item.packingList, row.item.ourOrder, row.item.almacen)"
                variant="danger" v-if="!disableButtonDelete"><v-icon name="trash-alt"></v-icon></b-button>

      <b-button variant="danger" disabled v-else><v-icon name="trash-alt"></v-icon></b-button>
    </template>

    <template slot="row-details" slot-scope="row">
      <b-table
        :items="row.item.packingList"
        :fields="fieldsRolls"
        striped
        >
        <template slot="kg" slot-scope="row">
          {{(row.item.kg).toFixed(2)}}
        </template>
      </b-table>
    </template>
  </b-table>
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
      if (this.currentUser.email === 'omar.duran@corrugadosaltavista.com') return false
      else return true
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
      filter: '',
      fields: ['provided', 'date', 'shipped', 'shipment', 'carrier', 'vehicle',
               'booking', 'comment', 'ourOrder', 'yourOrder', 'almacen', 'download', 'rolls', 'delete'],
      fieldsRolls: [
        {key: 'idNumber', label: 'Numero de rollo'},
        'almacen',
        {key: 'meters', label: 'Metros lineales'},
        'gramaje',
        {key: 'width', label: 'Ancho'},
        {key: 'typePaper', label: 'Tipo de papel'},
        {key: 'kg', label: 'Kilogramos'},
        {key: 'comments', label: 'Comentario'}],
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
            arr.push({
              'key': element,
              'idNumber': p.idNumber,
              'meters': p.meters,
              'gramaje': p.gramaje,
              'typePaper': p.typePaper,
              'kg': p.kg,
              'weight': p.weight,
              'width': `${p.width}\"`,
              'comments': p.comments
            })
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
    }
  }
}
</script>
