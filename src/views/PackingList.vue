<template>
<div>
  <h2>PACKING LIST</h2>
  <b-container fluid>
    <template v-if="showFilters">
      <b-row class="mb-2">
        <b-col cols="4">
          <b-input-group>
            <b-input-group-text slot="prepend">Almacen</b-input-group-text>
            <b-form-input v-model="filterAlmacen"></b-form-input>
          </b-input-group>
        </b-col>
        <b-col cols="4">
          <b-input-group>
            <b-input-group-text slot="prepend">Gramaje</b-input-group-text>
            <b-form-input v-model="filterGramaje"></b-form-input>
          </b-input-group>
        </b-col>
        <b-col cols="4">
          <b-input-group>
            <b-input-group-text slot="prepend">Tipo papel</b-input-group-text>
            <b-form-input v-model="filterType"></b-form-input>
          </b-input-group>
        </b-col>
        <!-- <b-col cols="12" md="4" offset-md="7"> -->
        <!--   <b-input-group> -->
        <!--     <b-input-group-prepend is-text> -->
        <!--       <v-icon name="search"></v-icon> -->
        <!--     </b-input-group-prepend> -->
        <!--     <b-form-input v-model="filter" placeholder="Busqueda"> -->
        <!--     </b-form-input> -->
        <!--   </b-input-group> -->
        <!-- </b-col> -->
      </b-row>
      <b-row>
        <b-col cols="4">
          <b-input-group>
            <b-input-group-text slot="prepend">Width</b-input-group-text>
            <b-form-input v-model="filterWidth"></b-form-input>
          </b-input-group>
          <b-input-group class="pt-2">
            <b-input-group-text slot="prepend">Numero papel</b-input-group-text>
            <b-form-input v-model="filterNumberRoll"></b-form-input>
          </b-input-group>
          <download-excel
            class="btn btn-primary mt-4"
            :data="getRolls"
            name="datos.xls" v-if="getRolls.length != 0">
            Exportar datos a excel
          </download-excel>
          <!-- <b-button class="mt-4">Exportar</b-button> -->
        </b-col>
        <b-col cols="8">
          <b-card bg-variant="light" text-variant="dark" title="Rollos información">
            <b-card-text>
              <b-row>
                <div v-for="gramaje, index in totalRolls.rollsByGramaje">

                  <b-col >
                    <b>{{gramaje.gramaje}} cantidad: {{gramaje.count}}</b>
                    <br/>

                  </b-col>

                </div>
                <b-col>
                  Total de rollos: <b>{{totalRolls.length}}</b>
                </b-col>
              </b-row>
            </b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </template>

    <b-tabs class="bg-light" pills card>

      <b-tab title="Packing list" @click="showFilters = false">
        <b-table
          :items="order"
          :fields="fields"
          :filter="filter"
          head-variant="dark"
          responsive
          >
          <template slot=""></template>
          <template slot="download" slot-scope="row">
            <a class="btn btn-primary" :href="row.item.download"><v-icon name="download"></v-icon></a>
          </template>
          <template slot="rolls" slot-scope="row">
            <b-button @click.stop="row.toggleDetails"><v-icon name="expand-arrows-alt"></v-icon></b-button>
          </template>
          <template slot="delete" slot-scope="row">
            <b-button @click="deleteOrder(row.item.key, row.item.packingList, row.item.ourOrder, row.item.almacen)" variant="danger" :disabled="disableButtonDelete">
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
      </b-tab>


      <b-tab title="Almacenes" @click="showFilters=true" >
        <b-table
          :items="getRolls"
          :fields="fieldsRolls2"
          :filter="filter"
          head-variant="dark"
          >

        </b-table>

      </b-tab>

    </b-tabs>

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
    computed: {
        disableButtonDelete(){
            if (this.currentUser.email === 'omar.duran@corrugadosaltavista.com') return false
            else return true

        },
        getRolls(){
            let rolls = []
            for(let key in this.order){
                this.order[key].packingList.forEach( element => {
                    element.almacen = this.order[key].almacen
                    rolls.push(element)
                })
            }
            this.rollsFilter = rolls.filter( el => {
                return el.almacen.indexOf(this.filterAlmacen.toLowerCase()) > -1 &&
                    el.gramaje.indexOf(this.filterGramaje) > -1 &&
                    el.typePaper.toLowerCase().indexOf(this.filterType.toLowerCase()) > -1 &&
                    el.width.indexOf(this.filterWidth) > -1 &&
                    el.idNumber.toString().toLowerCase().indexOf(this.filterNumberRoll.toLowerCase()) > -1
            })
            return this.rollsFilter
        },
        totalRolls(){
            let total = {}
            total.length = this.rollsFilter.length

            // this.rollsFilter.forEach( roll => {
            //     console.log(roll.meters)
            //     total.meters += roll.meters
            // })
            // total.meters = this.rollsFilter.reduce( (a, b) => a + b.meters, 0).toFixed(2)

            let rollsByGramaje = {}
            this.rollsFilter.forEach( roll => {
                rollsByGramaje[roll.gramaje] = rollsByGramaje[roll.gramaje] || []
                rollsByGramaje[roll.gramaje].push(roll)
            })

            let gramajes = []
            let rollsByGramajeType = {}
            Object.keys(rollsByGramaje).forEach( key => {
                rollsByGramaje[key].forEach( roll => {
                    let keyGramajeType = `${key} - ${roll.typePaper}`
                    rollsByGramajeType[keyGramajeType] = rollsByGramajeType[keyGramajeType] || []
                    rollsByGramajeType[keyGramajeType].push('')
                })
            })
            Object.keys(rollsByGramajeType).forEach( key => {
                gramajes.push({'gramaje': key, 'count': rollsByGramajeType[key].length})
            })
            total.rollsByGramaje = gramajes
            return total
        }

    },
    data(){
        return{
            db: firebase.database(),
            currentUser: firebase.auth().currentUser,
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
                     'booking', 'comment', 'ourOrder', 'yourOrder', 'almacen', 'download', 'rolls', 'delete'],
            fieldsRolls: ['idNumber', 'meters', 'gramaje', 'width', 'typePaper', 'kg', 'comments'],
            fieldsRolls2: ['idNumber', 'almacen', 'meters', 'gramaje', 'width', 'typePaper', 'kg', 'comments'],
            showFilters: false,
            filterAlmacen: '',
            filterGramaje: '',
            filterType: '',
            filterWidth: '',
            filterNumberRoll: '',
            rollsFilter: []
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
                            'width': `${p.width}"`,
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
