<template>
<div>
  <h2>Inventario</h2>
  <b-tabs class="bg-light" pills card>

    <b-tab title="Inventario"
           @click="loadIndex()"
           active >

      <IndexInventario
        :items="items"
        :fields="fields"
        :actualTab="actualTab">
      </IndexInventario>
    </b-tab>

    <b-tab title="Sobrantes"
           @click="loadSobrantes()"
           >
      <IndexInventario
        :items="itemsSobrantes"
        :fields="fields"
        :actualTab="actualTab">
      </IndexInventario>
    </b-tab>

    <b-tab title="Consumos"
           @click="loadHistorial"
           >
      <IndexInventario
        :items="itemsHistorial"
        :fields="fields"
        :actualTab="actualTab">
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
  computed: {
    disableActions(){
      if (this.currentUser.email === 'omar.duran@corrugadosaltavista.com' ||
      this.currentUser.email === 'guillermo.hernandez@corrugadosaltavista.com' ||
      this.currentUser.email === 'jose.rodriguez@corrugadosaltavista.com' ||
      this.currentUser.email === 'admin@corrugadosaltavista.com') return false
      else return true
    },
  },
  mounted(){
    this.loadIndex()
  },
  data(){
    return {
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      fields: [],
      items: [],
      itemsSobrantes: [],
      itemsHistorial: [],
      desperdiciosDiariosItems: [],
      desperdiciosDiariosFields: ['fecha', 'cantidad', 'turno'],
      actualTab: ''

    }
  },
  methods: {
    loadIndex: function(){
      this.actualTab = 0
      this.fields = [
        {
          key: 'idNumber',
          label: 'Num Rollo'
        },
        {
          key: 'bodega',
          sortable: true
        },
        {
          key: 'enUso',
          label: 'En Uso',
          sortable: true
        },
        {
          key: 'kgs',
          label: 'Kgs'
        },
        {
          key: 'meters',
          label: 'Metros'
        },
        {
          key: 'gramaje',
          label: 'Gramaje',
          sortable: true
        },
        {
          key: 'width',
          label: 'Ancho'
        },
        {
          key: 'typePaper',
          label: 'Tipo Papel',
          sortable: true
        },
        {
          key: 'numeroDUA',
          label: 'DUA'
        },
        {
          key: 'numeroBoleta',
          label: 'Boleta'
        },
        {
          key: 'comments',
          label: 'Coment'
        },
        {
          key: 'fecha',
          label: 'Fecha Ingreso'
        },
        {
          key: 'hora',
          label: 'Hora Ingreso'
        },
        // 'fechaTraslado',
        this.disableActions ? null : 'acciones'
      ]
      this.db.ref('/Inventario')
        .on('value', snapshot => {
          this.items = []
          this.loadData(snapshot.val(), this.items)
        })
      // this.db.ref('/Inventario')
      //   .once('value').then( snapshot => {
      //     this.items = []
      //     this.loadData( snapshot.val(), this.items)
      //   })
    },
    loadSobrantes: function(){
      this.actualTab = 1
      this.fields = [
        {
          key: 'idNumber',
          label: 'Num Rollo',
        },
        {
          key: 'enUso',
          label: 'En Uso',
          sortable: true
        },
        {
          key: 'kgsOriginales',
          label: 'Kgs Orig.'
        },
        {
          key: 'kgsActuales',
          label: 'Kgs Act.'
        },
        {
          key: 'kgsConsumidos',
          label: 'Kgs Consum.'
        },
        {
          key: 'gramaje',
          sortable: true
        },
        {
          key: 'width',
          label: 'Ancho',
          sortable: true
        },
        {
          key: 'typePaper',
          label: 'Tipo Papel',
          sortable: true
        },
        {
          key: 'desperdicio',
          label: 'Hojas desperd'
        },
        {
          key: 'causaDesperdicio',
          label: 'Causa Desperd'
        },
        'diametro',
        'fecha',
        'hora',
        this.disableActions ? null : 'acciones'
      ]
      this.db.ref('/InventarioSobrantes')
        .on('value', snapshot => {
          this.itemsSobrantes = []
          this.loadData( snapshot.val(), this.itemsSobrantes)
        })
    },
    loadHistorial: function(){
      this.actualTab = 2
      this.fields = [
        {
          key: 'idNumber',
          label: 'Num Rollo'
        },
        {
          key: 'fecha',
          label: 'Fecha'
        },
        {
          key: 'kgs',
          label: 'Kgs'
        },
        {
          key: 'meters',
          label: 'Metros'
        },
        {
          key: 'gramaje',
          sortable: true
        },
        {
          key: 'width',
          label: 'Ancho',
          sortable: true
        },
        {
          key: 'typePaper',
          label: 'Tipo Papel',
          sortable: true
        },
        {
          key: 'numeroDUA',
          label: 'DUA'
        },
        {
          key: 'numeroBoleta',
          label: 'Boleta'
        },
        'desperdicio',
        {
          key: 'comments',
          label: 'Comentario'
        },
        this.disableActions ? null : 'acciones'
      ]
      this.db.ref('/HistorialInventario')
        .on('value', snapshot => {
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
        // let fechaTraslado = typeof data[key].fechaTraslado !== 'undefined' ? data[key].fechaTraslado : null

        // let fechaTrasladoFormat = null
        // if(fechaTraslado){
        //   let fechaArray = fechaTraslado.split('-')
        //   let day = fechaArray[0]
        //   let month = fechaArray[1] - 1
        //   let year = fechaArray[2]

        //   fechaTrasladoFormat = new Date(year, month, day);
        // }

        items.push({
          'key': key,
          'idNumber': data[key].idNumber,
          'bodega': data[key].bodega,
          'enUso': data[key].enUso,
          'kgs': Math.round(data[key].kgs),
          'kgsOriginales': typeof data[key].kgsOriginales !== 'undefined' ? Math.round(data[key].kgsOriginales) : null,
          'kgsActuales': typeof data[key].kgsActuales !== 'undefined' ? Math.round(data[key].kgsActuales) : null,
          'kgsConsumidos': typeof data[key].kgsConsumidos !== 'undefined' ? data[key].kgsConsumidos : null,
          'meters': typeof data[key].meters !== 'undefined' ? Math.round(data[key].meters) : null,
          'width': `${data[key].width}`,
          'gramaje': data[key].gramaje,
          'typePaper': data[key].typePaper,
          'numeroDUA': typeof data[key].numeroDUA !== 'undefined' ? (data[key].numeroDUA).toString() : null,
          'numeroBoleta': typeof data[key].numeroBoleta !== 'undefined' ? (data[key].numeroBoleta).toString() : null,
          'comments': data[key].comments,
          'desperdicio': data[key].desperdicio,
          'causaDesperdicio': data[key].causaDesperdicio,
          'diametro': data[key].diametro,
          'fecha': fechaFormat,
          'hora': data[key].hora,
          // 'fechaTraslado': fechaTrasladoFormat
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
              'cantidad': data[key].cantidad,
              'turno': data[key].turno
            })
          }

        })

    }
  }
}

</script>
