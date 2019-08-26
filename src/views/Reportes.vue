<template>
  <b-container fluid="">
      <h2>Reportes</h2>
      <b-row>
        <b-col cols="8" offset="2">
          <b-button @click="exportar" v-if="totalRolls.length > 0" variant="primary" block>Resumen total inventario</b-button>
        </b-col>
      </b-row>
      <!-- {{totalRolls}} -->
      <!-- {{groupByTypePaper.liner}} -->
      <!-- <b-table :items="groupByTypePaper.liner"></b-table> -->
  </b-container>
</template>
<script>
import firebase from 'firebase/app'
import XLSX from 'xlsx'
export default {
  name: 'Reportes',
  computed: {
    groupByTypePaper: function(){
        let filter = {}
        let wt = []
        let linerR = []
        let liner = []
        let medium = []

        this.totalRolls.rollsByGramaje.forEach( el => {
          let typePaper = (el.tipo).split('-')
          if(typePaper[1] === 'WHITE TOP'){
            el.tipo = typePaper[0]
            el.bodega = typePaper[2]
            wt.push(el)
          }else if(typePaper[1] === 'LINER R'){
            el.tipo = typePaper[0]
            el.bodega = typePaper[2]
            linerR.push(el)
          }else if(typePaper[1] === 'LINER'){
            el.tipo = typePaper[0]
            el.bodega = typePaper[2]
            liner.push(el)
          }else if(typePaper[1] === 'MEDIUM'){
            el.tipo = typePaper[0]
            el.bodega = typePaper[2]
            medium.push(el)
          }

        })
        filter['wt'] = wt
        filter['liner'] = liner
        filter['linerR'] = linerR
        filter['medium'] = medium
        return filter
    },
    totalRolls: function(){
      let total = {}

      total.length = this.rollosInventario.length

      let rollsByGramaje = {}

      this.rollosInventario.forEach( roll => {

         //Borrar espacios en el tipo de papel para evitar problemas en los filtros
        let typePaper = roll.typePaper
        if (typePaper.includes('WHITE TOP')) {
          roll.typePaper = 'WHITE TOP'
        }
        else if (typePaper.includes('LINER R')){
          roll.typePaper = 'LINER R'
        }else if (typePaper.includes('LINER')){
          roll.typePaper = 'LINER'
        }else if(typePaper.includes('MEDIUM')){
          roll.typePaper = 'MEDIUM'
        }

        rollsByGramaje[roll.gramaje] = rollsByGramaje[roll.gramaje] || []
        rollsByGramaje[roll.gramaje].push(roll)
      })

      let gramajes = []
      let rollsByGramajeType = {}


      Object.keys(rollsByGramaje).forEach( key => {

        rollsByGramaje[key].forEach( roll => {
          let keyGramajeType = `${key} en ${roll.width}-${roll.typePaper}-${roll.bodega}`
          rollsByGramajeType[keyGramajeType] = rollsByGramajeType[keyGramajeType] || []
          rollsByGramajeType[keyGramajeType].push({kgs: roll.kgs})
        })
      })

      Object.keys(rollsByGramajeType).forEach( key => {

        gramajes.push({'tipo': key, 'cantidad': rollsByGramajeType[key].length, 'roll': rollsByGramajeType[key]})
      })

      let gramajesAlt = []
      gramajes.forEach( el => {
        let peso = 0

        for (let i in el.roll){
          peso += el.roll[i].kgs
        }
        el.peso = peso
        delete el.roll
        gramajesAlt.push(el)
      })
      console.log(gramajes)

      total.rollsByGramaje = gramajesAlt

      return total
    }
  },
  mounted: function (){

    this.db.ref('/Inventario')
      .on('value', snapshot => {
        this.items = []
        this.loadRollosInventario(snapshot.val())
      })
  },
  data () {
    return {
      db: firebase.database(),
      rollosInventario: []
    }
  },
  methods: {
    loadRollosInventario: function(snap){
      for (let key in snap){
        this.rollosInventario.push(snap[key])
      }
    },
    filterBodega: function (arr, bodega){
      let filt = []
      if(bodega === 1){
        filt = arr.filter( r => {
          return r.bodega === '1'
        })
      }else if(bodega === 2){
        filt = arr.filter(r => {
          return r.bodega === 'Planta'
        })
      }
      return filt
    },
    exportar: function(){

      let cpWt = (this.groupByTypePaper.wt).slice()
      let cpWt1 = this.filterBodega(cpWt, 1)
      let cpWt2 = this.filterBodega(cpWt, 2)
      let cpMedium = (this.groupByTypePaper.medium).slice()
      let cpMedium1 = this.filterBodega(cpMedium, 1)
      let cpMedium2 = this.filterBodega(cpMedium, 2)
      let cpLiner = (this.groupByTypePaper.liner).slice()
      let cpLiner1 = this.filterBodega(cpLiner, 1)
      let cpLiner2 = this.filterBodega(cpLiner, 2)
      let cpLinerR = (this.groupByTypePaper.linerR).slice()
      let cpLinerR1 = this.filterBodega(cpLinerR, 1)
      let cpLinerR2 = this.filterBodega(cpLinerR, 2)

      cpWt1.unshift({'Tipo papel': 'WHITE TOP'})
      cpWt1.unshift({})

      cpWt2.forEach( el => {
        cpWt1.push(el)
      })
      cpWt1.push({})

      cpWt1.push({'Tipo papel': 'MEDIUM'})
      cpMedium1.forEach( el => {
        cpWt1.push(el)
      })
      cpMedium2.forEach( el => {
        cpWt1.push(el)
      })
      cpWt1.push({})

      cpWt1.push({'Tipo papel': 'LINER'})
      cpLiner1.forEach( el => {
        cpWt1.push(el)
      })
      cpLiner2.forEach( el => {
        cpWt1.push(el)
      })
      cpWt1.push({})

      cpWt1.push({'Tipo papel': 'LINER R'})
      cpLinerR1.forEach( el => {
        cpWt1.push(el)
      })
      cpLinerR2.forEach( el => {
        cpWt1.push(el)
      })
      let wswt = XLSX.utils.json_to_sheet(cpWt1)

      let wsliner = XLSX.utils.json_to_sheet(this.groupByTypePaper.liner)
      let wb = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(wb, wswt, 'resumen')

      XLSX.writeFile(wb, 'resumen.xlsx')
    }
  }

}
</script>
