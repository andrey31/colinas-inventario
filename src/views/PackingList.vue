<template>
<div>
  <h2>PACKING LIST</h2>
  <b-container fluid>

    <b-row class="mb-2">
      <b-col cols="12" md="4" offset-md="7">
        <b-input-group>
          <b-input-group-prepend is-text>
            <v-icon name="search"></v-icon>
          </b-input-group-prepend>
          <b-form-input v-model="filter" placeholder="Busqueda">
          </b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
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
      <template slot="show" slot-scope="row">
        <b-button @click.stop="row.toggleDetails"><v-icon name="expand-arrows-alt"></v-icon></b-button>
      </template>
      <template slot="delete" slot-scope="row">
        <b-button @click="deleteOrder(row.item.key, row.item.packingList, row.item.ourOrder, row.item.almacen)" variant="danger" >
          <v-icon name="trash-alt"></v-icon>
        </b-button>
      </template>
    <template slot="row-details" slot-scope="row">
      <b-table
        :items="row.item.packingList"
        :fields="fieldsRolls"
        striped
        >
      </b-table>
    </template>
  </b-table>

  </b-container>

</div>
</template>

<script>
import firebase from 'firebase/app'
export default{
    name: 'PackingList',
    mounted(){
        // Cuando se visite la url /packing-list hace la petición para cargar los
        // datos de firebase
        this.db.ref('/order')
            .on('value', snapshot => this.loadData(snapshot.val()))
    },
    data(){
        return{
            db: firebase.database(),
            order: [],
            packingList: [],
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
                     'booking', 'comment', 'ourOrder', 'yourOrder', 'almacen', 'download', 'show', 'delete'],
            fieldsRolls: ['idNumber', 'meters', 'paperGrade', 'kg', 'weight', 'width', 'comments']
        }
    },
    methods: {
        deleteOrder: function(key, rolls, ourOrder, almacen){
            this.db.ref('/order').child(key).remove()
            rolls.forEach( rol => {
                this.db.ref('/packing-list').child(almacen).child(rol.key).remove()
            })

            let xls = firebase.storage().ref().child('packing-list/'+rolls[0].idNumber+'.xlsx')
            xls.delete().then( () => {
                console.log('borrado')
            }).catch( (error) => {
                console.log(error)
            })

        },
        loadPackingList: function(data, almacen){
            let arr = []
            data.forEach( element => {

                this.db.ref('/packing-list').child(almacen).child(element).once('value')
                    .then(snapshot => {
                        let p = snapshot.val()
                        arr.push({
                            'key': element,
                            'idNumber': p.idNumber,
                            'meters': p.meters,
                            'paperGrade': p.paperGrade,
                            'kg': p.kg,
                            'weight': p.weight,
                            'width': p.width,
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
        },
    }
}

</script>
