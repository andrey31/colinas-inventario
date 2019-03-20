<template>
<div>
  <h2>PACKING LIST</h2>
  <b-container fluid>

    <b-table
      :items="order"
      :fields="fields"
      head-variant="dark"
      responsive
      >
      <template slot="download" slot-scope="row">
        <a :href="row.item.download">Descargar</a>
      </template>
      <template slot="show" slot-scope="row">
        <b-button @click.stop="row.toggleDetails" >Mostrar</b-button>
      </template>
      <template slot="delete" slot-scope="row">
        <b-button @click="deleteOrder(row.item.key, row.item.packingList, row.item.ourOrder)" variant="danger" >Eliminar</b-button>
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

            fields: ['date', 'shipped', 'shipment', 'carrier', 'vehicle',
                     'booking', 'comment', 'ourOrder', 'yourOrder', 'download', 'show', 'delete'],
            fieldsRolls: ['idNumber', 'lineal', 'paperGrade', 'tons', 'weight', 'width', 'comments']
        }
    },
    methods: {
        deleteOrder: function(key, rolls, ourOrder){
            this.db.ref('/order').child(key).remove()
            rolls.forEach( rol => {
                this.db.ref('/packing-list').child(rol.key).remove()
            })

            let xls = firebase.storage().ref().child('packing-list/'+ourOrder+'.xlsx')
            xls.delete().then( () => {
                console.log('borrado')
            }).catch( (error) => {
                console.log(error)
            })

        },
        loadPackingList: function(data){
            let arr = []
            data.forEach( element => {
                this.db.ref('/packing-list').child(element).once('value')
                    .then(snapshot => {
                        let p = snapshot.val()
                        arr.push({
                            'key': element,
                            'idNumber': p.idNumber,
                            'lineal': p.lineal,
                            'paperGrade': p.paperGrade,
                            'tons': p.tons,
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
                    'download': data[key].downloadXLS,
                    'packingList': this.loadPackingList(data[key]['packing-list'])
                })
            }
        },
    }
}

</script>
