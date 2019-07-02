<template>
<div>
  <h2>Inventario</h2>
  <b-tabs class="bg-light" pills card>

    <b-tab title="Inventario"
           @click="loadIndex()"
           active >

      <IndexInventario
        :items="items"
        :fields="fields">
      </IndexInventario>
    </b-tab>

    <b-tab title="Sobrantes"
           @click="loadSobrantes()"
           >
      <IndexInventario
        :items="itemsSobrantes"
        :fields="fields">
      </IndexInventario>
    </b-tab>

    <b-tab title="Historial"
           @click="loadHistorial"
           >
      <IndexInventario
        :items="itemsHistorial"
        :fields="fields">
      </IndexInventario>
    </b-tab>

    <b-tab title="Desperdicios diarios"
           @click="loadDesperdicios">
      <desperdicios-diarios
        :items="desperdiciosDiariosItems"
        :fields="desperdiciosDiariosFields"
        >

      </desperdicios-diarios>
    </b-tab>

  </b-tabs>
</div>
</template>

<script>
import firebase from 'firebase/app'
import IndexInventario from '../components/inventario/Index.vue'
import DesperdiciosDiarios from '../components/inventario/DesperdiciosDiarios.vue'

export default{
  name: 'Inventario',
  components: {
    DesperdiciosDiarios,
    IndexInventario
  },
  mounted(){
    this.loadIndex()
  },
  data(){
    return {
      db: firebase.database(),
      fields: [],
      items: [],
      itemsSobrantes: [],
      itemsHistorial: [],
      desperdiciosDiariosItems: [],
      desperdiciosDiariosFields: ['fecha', 'cantidad']

    }
  },
  methods: {
    loadIndex: function(){
      this.fields = ['idNumber', 'bodega', 'enUso', 'kgs', 'meters', 'gramaje', 'width', 'typePaper', 'comments']
      this.db.ref('/Inventario')
        .once('value').then( snapshot => {
          this.items = []
          this.loadData( snapshot.val(), this.items)
        })
    },
    loadSobrantes: function(){
      this.fields = ['idNumber', 'bodega', 'enUso', 'kgs', 'gramaje', 'width', 'typePaper', 'desperdicio', 'diametro', 'fecha', 'hora']
      this.db.ref('/InventarioSobrantes')
        .once('value').then( snapshot => {
          this.itemsSobrantes = []
          this.loadData( snapshot.val(), this.itemsSobrantes)
        })
    },
    loadHistorial: function(){

      this.fields = [
        'idNumber', 'fecha', 'kgs', 'meters', 'gramaje', 'width', 'typePaper', 'desperdicio', 'comments'
      ]
      this.db.ref('/HistorialInventario')
        .once('value').then( snapshot => {
          this.itemsHistorial = []
          this.loadData( snapshot.val(), this.itemsHistorial)
        })

    },
    loadData: function(data, items){
      for(let key in data){

        let fecha = typeof data[key].fecha !== 'undefined' ? data[key].fecha : null

        let fechaFormat =  null
        if(fecha){
          let fechaArray = fecha.split('-')
          let day = fechaArray[0]
          let month = fechaArray[1] - 1
          let year = fechaArray[2]
          fechaFormat = new Date(year, month, day)
        }

        items.push({
          'idNumber': data[key].idNumber,
          'bodega': data[key].bodega,
          'enUso': data[key].enUso,
          'kgs': data[key].kgs.toFixed(2),
          'meters': typeof data[key].meters !== 'undefined' ? data[key].meters.toFixed(2) : null,
          'width': `${data[key].width}"`,
          'gramaje': data[key].gramaje,
          'typePaper': data[key].typePaper,
          'comments': data[key].comments,
          'desperdicio': data[key].desperdicio,
          'diametro': data[key].diametro,
          'fecha': fechaFormat,
          'hora': data[key].hora
        })
      }
    },
    loadDesperdicios: function(){

      this.db.ref('/DesperdiciosDiarios')
        .once('value').then( snapshot => {
          this.desperdiciosDiariosItems = []
          let data = snapshot.val()
          for (let key in data){
            let fechaArray = data[key].fecha.split('-')
            console.log(fechaArray)
            let day = fechaArray[0]
            let month = fechaArray[1] - 1
            let year = fechaArray[2]

            this.desperdiciosDiariosItems.push({
              'fecha': new Date(year, month, day),
              'cantidad': data[key].cantidad
            })
          }

        })

    }
  }
}

</script>
