<template>
<div>
  <h2>PACKING LIST</h2>
  <b-container>

    <b-table
      :items="order"
      :fields="fields"
      head-variant="dark"
      >
      <template slot="download" slot-scope="row">
        <a :href="row.item.download">Descargar</a>
      </template>
      <template slot="actions" slot-scope="row">
        <b-button @click.stop="row.toggleDetails" >Mostrar</b-button>
        <b-button @click="deleteOrder(row.item.key, row.item.packingList)" variant="danger" class="ml-2">Eliminar</b-button>
    </template>

    <template slot="row-details" slot-scope="row">

      <b-table
        :items="row.item.packingList"
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
            fields: ['ourOrder','provided', 'shipped', 'date', 'yourOrder', 'download', 'actions']
        }
    },
    methods: {
        deleteOrder: function(key, rolls){
            this.db.ref('/order').child(key).remove()
            rolls.forEach( rol => {
                this.db.ref('/packing-list').child(rol.key).remove()
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
                    'ourOrder': data[key].ourOrder,
                    'provided': data[key].provided,
                    'shipped': data[key].shipped,
                    'date': data[key].date,
                    'yourOrder': data[key].yourOrder,
                    'download': data[key].downloadXLS,
                    'packingList': this.loadPackingList(data[key]['packing-list'])
                })
            }
        },
    }
}

</script>
