<template>
<div>
  <h2>PACKING LIST</h2>
  <b-table
    :items="order"
    >
    <template slot="download" slot-scope="row">
      <a :href="row.item.download">Descargar</a>
    </template>
    <template slot="packingList" slot-scope="row">
      <b-button @click.exact="chargePackingList(row.item.packingList)" @click.stop="row.toggleDetails" >Mostrar</b-button>
    </template>

    <template slot="row-details" slot-scope="row">
      <b-table
        :items="packingList"
        >
      </b-table>
    </template>
  </b-table>
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
            packingList: []
        }
    },
    methods: {
        chargePackingList: function(pack){
            if(this.packingList.length === 0){
                pack.forEach((element) => {
                    this.db.ref('/packing-list').child(element).once('value')
                        .then( snapshot => {
                            let p = snapshot.val()

                            this.packingList.push({
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
            }
        },

        loadData: function(data){
            this.packingList = []

            for (let key in data){
                this.order.push({
                    'ourOrder': data[key].ourOrder,
                    'provided': data[key].provided,
                    'shipped': data[key].shipped,
                    'date': data[key].date,
                    'yourOrder': data[key].yourOrder,
                    'download': data[key].downloadXLS,
                    'packingList': data[key]['packing-list']
                })
            }
        },
    }
}

</script>
