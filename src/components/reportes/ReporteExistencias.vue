<template>
  <b-container>
    <b-row>
      <b-col cols="12" md="6" class="p-3 border border-muted mr-1" offset="3">
        <b-form-group >
          <h4 slot="label"><b>Ubicación</b></h4>
          <b-form-checkbox class="pb-4" v-model="allSelect" @change="changeSelectAll">
            <b>Seleccionar todas las ubicaciones</b>
          </b-form-checkbox>
          <b-form-checkbox-group id="checkbox-group-1" v-model="ubicationSelected" :options="ubications" name="flavour-1"   >
          </B-form-checkbox-group>
        </b-form-group>
      </b-col>
      <b-col cols="12" class="pt-2">
        <b-form-group label="">
          <h6 slot="label"><b>Agrupar por:</b></h6>
          <b-form-radio-group v-model="groupBy" :options="groupByOptions" name="radios-stacked">
          </b-form-radio-group>
        </b-form-group>
      </b-col>

      <!-- <b-col cols="12" md="5" class="p-3 border border-muted"> -->
      <!--   <b-form-group> -->
      <!--     <label slot="label" class="pb-0 mb-0"><b>Fecha límite</b></label> -->
      <!--     <\!-- <b-input-group-text slot="prepend" >Fecha Límite</b-input-group-text> -\-> -->
      <!--     <b-form-input type="date"></b-form-input> -->
      <!--   </b-form-group> -->
      <!-- </b-col> -->
      <b-col cols="12" class="text-muted" v-if="textExport !== ''">
        Información: {{textExport}}
      </b-col>
      <b-col cols="12" class="pt-4">
        <h4><b>Exportar</b></h4>
      </b-col>
      <b-col class="pt-2" cols="12">

        <b-button variant="success" size="lg" class="mr-2 p-2"
                  @click="exportReport('xls')" :disabled="ubicationSelected.length === 0 || disableButtonXLS">
          <b-spinner label="Spinning" v-if="exportExcel"></b-spinner>
          EXCEL
          <v-icon class="ml-2" name="file-excel" scale="2"></v-icon>
        </b-button>
        <b-button variant="danger" size="lg"
                  :disabled="ubicationSelected.length === 0 || disableButtonPDF" @click="exportReport('pdf')">
          <b-spinner label="Spinning" v-if="exportPDF"></b-spinner>
          PDF
          <v-icon class="ml-2"name="file-pdf" scale="2"></v-icon>
        </b-button>
        <!-- <b-button variant="primary" @click="exportReport" block >Generar reporte</b-button> -->
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import firebase from 'firebase/app'
import XLSX from 'xlsx'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { base64Img } from './logoBase64.js'

export default {
  name: 'reporte-existencias',
  data () {
    return {
      db: firebase.database(),
      ubicationSelected: [],
      ubications: [
        { text: 'En Transito', value: 'enTransito' },
        { text: 'Telisa', value: 'telisa' },
        { text: 'Sislocar', value: 'sislocar' },
        { text: 'Bodega 1', value: 'bodega1' },
        { text: 'Bodega Planta', value: 'planta' }
      ],
      textExport: '',
      exportExcel: false,
      exportPDF: false,
      allSelect: false,
      xlsOrPdf: 'xls',
      disableButtonXLS: false,
      disableButtonPDF: false,
      groupBy: 1,
      groupByOptions: [
        { text: 'Ubicacion', value: 1},
        { text: 'Tipo papel', value: 2},
        { text: 'Totales', value: 3},
      ]
    }
  },
  methods: {
    changeSelectAll: function(select){
      if (select) {
        this.ubicationSelected = []
        this.ubications.forEach( u => {
          this.ubicationSelected.push(u.value)
        })
      }else {
        this.ubicationSelected = []
      }
    },
    groupByTypePaper: function (totalRolls) {
      let filter = {}
      let wt = []
      let liner = []
      let medium = []

      totalRolls.rollsByGramaje.forEach( el => {
        let typePaper = (el.tipo).split('-')
        if(typePaper[1].includes('WHITE TOP')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'WHITE TOP'
          el['Ubicacion'] = typePaper[2]
          wt.push(el)
        }else if(typePaper[1].includes('LINER')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'LINER'
          el['Ubicacion'] = typePaper[2]
          liner.push(el)
        }else if(typePaper[1].includes('MEDIUM')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'MEDIUM'
          el['Ubicacion'] = typePaper[2]
          medium.push(el)
        }
        delete el.tipo
      })

      filter['wt'] = wt
      filter['liner'] = liner
      filter['medium'] = medium
      return filter
    },
    totalRolls: function (allRolls){
      let total = {}
      total.length = allRolls.length
      let rollsByGramaje = {}

      allRolls.forEach( roll => {

        //Borrar espacios en el tipo de papel para evitar problemas en los filtros
        let typePaper = roll.typePaper
        if (typePaper.includes('WHITE TOP')) {
          roll.typePaper = 'WHITE TOP'
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
          let keyGramajeType = `${key} en ${roll.width}-${roll.typePaper}-${roll.ubicacion}`
          rollsByGramajeType[keyGramajeType] = rollsByGramajeType[keyGramajeType] || []
          rollsByGramajeType[keyGramajeType].push({kgs: roll.kgs, meters: roll.meters})
        })
      })

      Object.keys(rollsByGramajeType).forEach( key => {

        gramajes.push({
          'tipo': key,
          'Cantidad de rollos': rollsByGramajeType[key].length,
          'roll': rollsByGramajeType[key]
        })
      })

      let gramajesAlt = []
      gramajes.forEach( el => {
        let peso = 0
        let meters = 0
        for (let i in el.roll){
          peso += el.roll[i].kgs
          meters += el.roll[i].meters
        }
        el['Peso total (Kgs)'] = Math.round(peso)
        el['Metros total'] = Math.round(meters)
        delete el.roll
        gramajesAlt.push(el)
      })

      total.rollsByGramaje = gramajesAlt

      return total
    },
    formatByTotal: function(allRolls){
      let rolls = this.formatByTypePaper(allRolls)
      let r = rolls.slice()

      let result = [];

      r.reduce(function(res, value) {
        let t = value['Tipo papel']+value['Gramaje-Ancho']
        if (!res[t] && value['Tipo papel'] !== '') {
          res[t] = {
            'Tipo papel': value['Tipo papel'],
            'Gramaje-Ancho': value['Gramaje-Ancho'],
            'Cantidad de rollos': 0, 'Peso total (Kgs)': 0, 'Metros total': 0 };
          result.push(res[t])
        }
        if (value['Tipo papel'] !== '') {
          res[t]['Cantidad de rollos'] += Number(value['Cantidad de rollos']);
          res[t]['Peso total (Kgs)'] += Number(value['Peso total (Kgs)']);
          res[t]['Metros total'] += Number(value['Metros total']);
        }
        return res;
      }, {});
      //para rellernar el elemnto que se borra necesario en las demás exportaciones
      result.unshift({})
      return result
    },
    formatByTypePaper: function(allRolls){
      let totalRolls = this.totalRolls(allRolls)
      let groupByTypePaper = this.groupByTypePaper(totalRolls)

      let cpWt = (groupByTypePaper.wt).slice()
      let cpMedium = (groupByTypePaper.medium).slice()
      let cpLiner = (groupByTypePaper.liner).slice()
      let exportFormat = []

      let fecha = new Date()
      exportFormat.unshift(
        {
          'Fecha de reporte': fecha, 'Tipo papel': '',
          'Gramaje-Ancho': '', 'Cantidad de rollos': '',
          'Peso total (Kgs)': '', 'Metros total': '',
          'Ubicacion': ''
        }
      )
      if (cpWt.length > 0) {

        let cpWt1 = this.filterBodega(cpWt, 1)
        let cpWt2 = this.filterBodega(cpWt, 2)
        let cpWt3 = this.filterBodega(cpWt, 3)
        let cpWt4 = this.filterBodega(cpWt, 4)
        let cpWt5 = this.filterBodega(cpWt, 5)

        let cpWTAll = cpWt1.concat(cpWt2, cpWt3, cpWt4, cpWt5)
        let wtRollosTotal = 0
        let wtPesoTotal = 0
        let wtMetrosTotal = 0

        // cpWt.join()
        // cpWt.sort()
        cpWTAll.sort( (a, b) => {

          if (a['Gramaje-Ancho'] < b['Gramaje-Ancho']) return -1

          if( a['Gramaje-Ancho'] > b['Gramaje-Ancho']) return 1

          return 0
        })

        cpWTAll.forEach( wt => {
          wtRollosTotal += wt['Cantidad de rollos']
          let p = wt['Peso total (Kgs)']
          wtPesoTotal += Number(p)

          let m = wt['Metros total']
          wtMetrosTotal += Number(m)

          exportFormat.push(wt)
        })
        // cpWt1.forEach( el => { exportFormat.push(el) })
        // cpWt2.forEach( el => { exportFormat.push(el) })
        // cpWt3.forEach( el => { exportFormat.push(el) })
        // cpWt4.forEach( el => { exportFormat.push(el) })
        // cpWt5.forEach( el => { exportFormat.push(el) })

        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '**Total**', 'Cantidad de rollos': wtRollosTotal,
            'Peso total (Kgs)': (wtPesoTotal),
            'Metros total': (wtMetrosTotal),
            'Ubicacion': ''
          }
        )
        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '', 'Cantidad de rollos': '',
            'Peso total (Kgs)': '', 'Metros total': '',
            'Ubicacion': ''
          }
        )

        // exportFormat.push({})
      }
      if (cpMedium.length > 0) {
        let cpMedium1 = this.filterBodega(cpMedium, 1)
        let cpMedium2 = this.filterBodega(cpMedium, 2)
        let cpMedium3 = this.filterBodega(cpMedium, 3)
        let cpMedium4 = this.filterBodega(cpMedium, 4)
        let cpMedium5 = this.filterBodega(cpMedium, 5)

        let cpMediumAll = cpMedium1.concat(cpMedium2, cpMedium3, cpMedium4, cpMedium5)
        let rollosTotal = 0
        let pesoTotal = 0
        let metrosTotal = 0


        cpMediumAll.sort( (a, b) => {

          if (a['Gramaje-Ancho'] < b['Gramaje-Ancho']) return -1

          if( a['Gramaje-Ancho'] > b['Gramaje-Ancho']) return 1

          return 0
        })

        cpMediumAll.forEach( m => {
          rollosTotal += m['Cantidad de rollos']
          let p = m['Peso total (Kgs)']
          pesoTotal += Number(p)

          let meters = m['Metros total']
          metrosTotal += Number(meters)

          exportFormat.push(m)
        })

        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '**Total**', 'Cantidad de rollos': rollosTotal,
            'Peso total (Kgs)': pesoTotal,
            'Metros total': metrosTotal,
            'Ubicacion': ''
          }
        )
        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '', 'Cantidad de rollos': '',
            'Peso total (Kgs)': '', 'Metros total': '',
            'Ubicacion': ''
          }
        )
        // exportFormat.push({})
      }
      if (cpLiner.length > 0) {
        let cpLiner1 = this.filterBodega(cpLiner, 1)
        let cpLiner2 = this.filterBodega(cpLiner, 2)
        let cpLiner3 = this.filterBodega(cpLiner, 3)
        let cpLiner4 = this.filterBodega(cpLiner, 4)
        let cpLiner5 = this.filterBodega(cpLiner, 5)

        let cpLinerAll = cpLiner1.concat(cpLiner2, cpLiner3, cpLiner4, cpLiner5)
        let rollosTotal = 0
        let pesoTotal = 0
        let metrosTotal = 0

        cpLinerAll.sort( (a, b) => {

          if (a['Gramaje-Ancho'] < b['Gramaje-Ancho']) return -1

          if( a['Gramaje-Ancho'] > b['Gramaje-Ancho']) return 1

          return 0
        })

        cpLinerAll.forEach( m => {
          rollosTotal += m['Cantidad de rollos']
          let p = m['Peso total (Kgs)']
          pesoTotal += Number(p)

          let meters = m['Metros total']
          metrosTotal += Number(meters)

          exportFormat.push(m)
        })

        exportFormat.push({
          'Fecha de reporte': '',
          'Tipo papel': '',
          'Gramaje-Ancho': '**Total**',
          'Cantidad de rollos': rollosTotal,
          'Peso total (Kgs)': pesoTotal,
          'Metros total': metrosTotal,
          'Ubicacion': ''
        })

        exportFormat.push({
          'Fecha de reporte': '',
          'Tipo papel': '',
          'Gramaje-Ancho': '',
          'Cantidad de rollos': '',
          'Peso total (Kgs)': '',
          'Metros total': '',
          'Ubicacion': ''
        })
        // exportFormat.push({})
      }

      // if (cpLinerR.length > 0){
      //     let cpLinerR1 = this.filterBodega(cpLinerR, 1)
      //     let cpLinerR2 = this.filterBodega(cpLinerR, 2)
      //     let cpLinerR3 = this.filterBodega(cpLinerR, 3)
      //     let cpLinerR4 = this.filterBodega(cpLinerR, 4)
      //     let cpLinerR5 = this.filterBodega(cpLinerR, 5)

      //     cpLinerR1.forEach( el => { exportFormat.push(el) })
      //     cpLinerR2.forEach( el => { exportFormat.push(el) })
      //     cpLinerR3.forEach( el => { exportFormat.push(el) })
      //     cpLinerR4.forEach( el => { exportFormat.push(el) })
      //     cpLinerR5.forEach( el => { exportFormat.push(el) })
      // }
      return exportFormat

    },
    formatByUbication: function(allRolls){
      let totalRolls = this.totalRolls(allRolls)
      let groupByTypePaper = this.groupByTypePaper(totalRolls)
      let cpWt = (groupByTypePaper.wt).slice()
      let cpMedium = (groupByTypePaper.medium).slice()
      let cpLiner = (groupByTypePaper.liner).slice()
      let exportFormat = []

      let fecha = new Date()
      exportFormat.unshift(
        {
          'Fecha de reporte': fecha, 'Tipo papel': '',
          'Gramaje-Ancho': '', 'Cantidad de rollos': '',
          'Peso total (Kgs)': '', 'Metros total': '',
          'Ubicacion': ''
        }
      )
      this.ubicationSelected.forEach(u => {

        if (u === 'enTransito') {

          let cpWt1 = this.filterBodega(cpWt, 1)
          let cpMedium1 = this.filterBodega(cpMedium, 1)
          let cpLiner1 = this.filterBodega(cpLiner, 1)

          let enTransitoAll = cpWt1.concat(cpMedium1, cpLiner1)

          if(enTransitoAll.length > 0) {

            enTransitoAll.sort( (a, b) => {

              let aCustom = a['Tipo papel'] + a['Gramaje-Ancho']
              let bCustom = b['Tipo papel'] + b['G']

              if (aCustom < bCustom) return -1
              if(aCustom > bCustom) return 1

              return 0
            })

            let enTransitoTotalK = 0
            let enTransitoTotalM = 0
            let enTransitoCantidad = 0
            enTransitoAll.forEach( el => {

              exportFormat.push(el)
              enTransitoTotalK += Number(el['Peso total (Kgs)'])
              enTransitoTotalM += Number(el['Metros total'])
              enTransitoCantidad += Number(el['Cantidad de rollos'])
            })

            exportFormat.push(
              {
                'Fecha de reporte': '', 'Tipo papel': '',
                'Gramaje-Ancho': '**Total**', 'Cantidad de rollos': enTransitoCantidad,
                'Peso total (Kgs)': enTransitoTotalK, 'Metros total': enTransitoTotalM,
                'Ubicacion': ''
              }
            )
            exportFormat.push(
              {
                'Fecha de reporte': '', 'Tipo papel': '',
                'Gramaje-Ancho': '', 'Cantidad de rollos': '',
                'Peso total (Kgs)': '', 'Metros total': '',
                'Ubicacion': ''
              }
            )
          }


        }
        if (u === 'telisa') {
          let cpWt2 = this.filterBodega(cpWt, 2)
          let cpMedium2 = this.filterBodega(cpMedium, 2)
          let cpLiner2 = this.filterBodega(cpLiner, 2)

          let enTelisaAll = cpWt2.concat(cpMedium2, cpLiner2)
          if (enTelisaAll.length > 0) {
            enTelisaAll.sort( (a, b) => {

              let aCustom = a['Tipo papel'] + a['Gramaje-Ancho']
              let bCustom = b['Tipo papel'] + b['Gramaje-Ancho']
              if (aCustom < bCustom) return -1

              if(aCustom > bCustom) return 1

              return 0
            })

            let enTelisaTotalK = 0
            let enTelisaTotalM = 0
            let enTelisaCantidad = 0

            enTelisaAll.forEach( el => {
              exportFormat.push(el)
              enTelisaTotalK += Number(el['Peso total (Kgs)'])
              enTelisaTotalM += Number(el['Metros total'])
              enTelisaCantidad += Number(el['Cantidad de rollos'])
            })


            exportFormat.push(
              {
                'Fecha de reporte': '', 'Tipo papel': '',
                'Gramaje-Ancho': '**Total**', 'Cantidad de rollos': enTelisaCantidad,
                'Peso total (Kgs)': enTelisaTotalK, 'Metros total': enTelisaTotalM,
                'Ubicacion': ''
              }
            )

            exportFormat.push(
              {
                'Fecha de reporte': '', 'Tipo papel': '',
                'Gramaje-Ancho': '', 'Cantidad de rollos': '',
                'Peso total (Kgs)': '', 'Metros total': '',
                'Ubicacion': ''
              }
            )
          }

        }
        if ( u === 'sislocar'){
          let cpWt3 = this.filterBodega(cpWt, 3)
          let cpMedium3 = this.filterBodega(cpMedium, 3)
          let cpLiner3 = this.filterBodega(cpLiner, 3)

          let enSislocarAll = cpWt3.concat(cpMedium3, cpLiner3)
          if(enSislocarAll.length > 0) {
            enSislocarAll.sort((a, b) => {
              let aCustom = a['Tipo papel'] + a['Gramaje-Ancho']
              let bCustom = b['Tipo papel'] + b['Gramaje-Ancho']
              if (aCustom < bCustom) return -1
              if(aCustom > bCustom) return 1
              return 0
            })

            let enSislocarTotalK = 0
            let enSislocarTotalM = 0
            let enSislocarTotalC = 0
            enSislocarAll.forEach( el => {
              exportFormat.push(el)

              enSislocarTotalK += Number(el['Peso total (Kgs)'])
              enSislocarTotalM += Number(el['Metros total'])
              enSislocarTotalC += Number(el['Cantidad de rollos'])
            })

            exportFormat.push({
              'Fecha de reporte': '',
              'Tipo papel': '',
              'Gramaje-Ancho': '**Total**',
              'Cantidad de rollos': enSislocarTotalC,
              'Peso total (Kgs)': enSislocarTotalK,
              'Metros total': enSislocarTotalM,
              'Ubicacion': ''
            })
            exportFormat.push({
              'Fecha de reporte': '',
              'Tipo papel': '',
              'Gramaje-Ancho': '',
              'Cantidad de rollos': '',
              'Peso total (Kgs)': '',
              'Metros total': '',
              'Ubicacion': ''
            })
          }
        }
        if (u === 'bodega1'){
          let cpWt4 = this.filterBodega(cpWt, 4)
          let cpMedium4 = this.filterBodega(cpMedium, 4)
          let cpLiner4 = this.filterBodega(cpLiner, 4)

          let bodegaAll = cpWt4.concat(cpMedium4, cpLiner4)

          if (bodegaAll.length > 0){
            bodegaAll.sort((a, b) => {
              let aCustom = a['Tipo papel'] + a['Gramaje-Ancho']
              let bCustom = b['Tipo papel'] + b['Gramaje-Ancho']
              if (aCustom < bCustom) return -1
              if(aCustom > bCustom) return 1
              return 0
            })

            let enBodegaTotalK = 0
            let enBodegaTotalM = 0
            let enBodegaTotalC = 0
            bodegaAll.forEach( el => {
              exportFormat.push(el)

              enBodegaTotalK += Number(el['Peso total (Kgs)'])
              enBodegaTotalM += Number(el['Metros total'])
              enBodegaTotalC += Number(el['Cantidad de rollos'])
            })

            exportFormat.push(
              {
                'Fecha de reporte': '', 'Tipo papel': '',
                'Gramaje-Ancho': '**Total**', 'Cantidad de rollos': enBodegaTotalC,
                'Peso total (Kgs)': enBodegaTotalK, 'Metros total': enBodegaTotalM,
                'Ubicacion': ''
              }
            )

            exportFormat.push(
              {
                'Fecha de reporte': '', 'Tipo papel': '',
                'Gramaje-Ancho': '', 'Cantidad de rollos': '',
                'Peso total (Kgs)': '', 'Metros total': '',
                'Ubicacion': ''
              }
            )
          }

        }
        if ( u === 'planta') {

          let cpWt5 = this.filterBodega(cpWt, 5)
          let cpMedium5 = this.filterBodega(cpMedium, 5)
          let cpLiner5 = this.filterBodega(cpLiner, 5)

          let plantaAll = cpWt5.concat(cpMedium5, cpLiner5)
          if (plantaAll.length > 0) {
            plantaAll.sort((a, b) => {
              let aCustom = a['Tipo papel'] + a['Gramaje-Ancho']
              let bCustom = b['Tipo papel'] + b['Gramaje-Ancho']
              if (aCustom < bCustom) return -1
              if(aCustom > bCustom) return 1
              return 0
            })
            let plantaTotalK = 0
            let plantaTotalM = 0
            let plantaTotalC = 0

            plantaAll.forEach( el => {
              exportFormat.push(el)

              plantaTotalK += Number(el['Peso total (Kgs)'])
              plantaTotalM += Number(el['Metros total'])
              plantaTotalC += Number(el['Cantidad de rollos'])
            })

            exportFormat.push(
              {
                'Fecha de reporte': '', 'Tipo papel': '',
                'Gramaje-Ancho': '**Total**', 'Cantidad de rollos': plantaTotalC,
                'Peso total (Kgs)': plantaTotalK, 'Metros total': plantaTotalM,
                'Ubicacion': ''
              }
            )
          }

        }

      })

      return exportFormat
    },
    sendXLS: function (allRolls) {
      let exportFormat = null
      if (this.groupBy === 1) exportFormat = this.formatByUbication(allRolls)
      if (this.groupBy === 2) exportFormat = this.formatByTypePaper(allRolls)
      if (this.groupBy === 3) exportFormat = this.formatByTotal(allRolls)
      if(this.xlsOrPdf === 'xls' ) this.exportToExcel(exportFormat)
      else this.exportToPdf(exportFormat)
    },
    exportToPdf: function(exportFormat){
      let fecha = new Date()
      let head = [
        [
          'Tipo papel', 'Gramaje-Ancho', 'Cantidad de rollos',
          'Peso total (Kgs)', 'Metros total'
        ]
      ]

      if(this.groupBy !== 3) head[0].push('Ubicacion')

      let body = []

      exportFormat.shift()
      exportFormat.forEach( e => {
        let data = []
        data.push(e['Tipo papel'])
        data.push(e['Gramaje-Ancho'])
        data.push(e['Cantidad de rollos'])
        data.push(e['Peso total (Kgs)'].toLocaleString('en-us'))
        data.push(e['Metros total'].toLocaleString('en-us'))
        data.push(e['Ubicacion'])
        body.push(data)

      })
      let doc = new jsPDF()
      var totalPagesExp = "{total_pages_count_string}";

      let colinas = "COLINAS ALTAVISTA S.A"

      let typeReport = ''
      if (this.groupBy === 1) typeReport = 'agrupado por ubicacion'
      if(this.groupBy === 2) typeReport = 'agrupado por tipo papel'
      if(this.groupBy === 3) typeReport = 'agrupado por totales'

      let day = fecha.getDate() < 10 ? '0' + fecha.getDate() : fecha.getDate()
      let month = fecha.getMonth() < 9 ? '0' + (fecha.getMonth()+1) : (fecha.getMoth()+1)

      let fechaFormat = `${day}/${month}/${fecha.getFullYear()}`

      let nameReport = `${colinas}\n REPORTE DE EXISTENCIAS DE ROLLOS\nAL: ${fechaFormat}`

      // Or JavaScript:
      doc.autoTable({
        head,
        body,
        styles: {overflow: 'ellipsize', cellWidth: 'wrap'},
        headStyles: {
          fillColor: [204, 152, 62],
        },
        columnStyles:  {
          0: {halign: 'center'}, 1: {halign: 'center'}, 2: {halign: 'center'},
          3: {halign: 'center', cellWidth: 'auto'}, 4: {halign: 'center'}, 5: {halign: 'center'}
        },
        didParseCell: function(data) {
          if (data.cell.text[0] === '' && data.row.index !== 0) {
            data.cell.text = '--'
            // 228, 233, 240
            data.cell.styles.fillColor = [228, 233, 240];
          }


        },
        didDrawPage: function (data) {
          // Header
          doc.setFontSize(16);
          doc.setTextColor(40);
          doc.setFontStyle('normal');

          doc.addImage(base64Img, 'png', data.settings.margin.left, 15, 25, 25);//imagen base64 en archivo aparte
          doc.addImage(base64Img, 'png', (doc.internal.pageSize.getWidth()-40), 15, 25, 25);
          let pw = (((doc.internal.pageSize).getWidth()))/2

          // if (doc.internal.getNumberOfPages() === 1) {
          //     doc.text(nameReport, pw, 22, { align: 'center', width: 100})
          // }
          doc.text(nameReport, pw, 22, { align: 'center', width: 100})

          // Footer

          let hour = fecha.getHours() < 10 ? `0${fecha.getHours()}` : fecha.getHours()
          let minutes = fecha.getMinutes() < 10 ? `0${fecha.getMinutes()}` : fecha.getMinutes()
          let seconds = fecha.getHours() < 10 ? `0${fecha.getSeconds()}` : fecha.getSeconds()

          var str =  `Página ${doc.internal.getNumberOfPages()}`

          if (typeof doc.putTotalPages === 'function') {
            str = `${str} de ${totalPagesExp} `
          }
          doc.setFontSize(8);

          var pageSize = doc.internal.pageSize
          var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
          doc.text(str, data.settings.margin.left, pageHeight - 10)
          let str2 = `Generado a las ${hour}:${minutes}:${seconds} ${typeReport}`
          doc.text(str2, data.settings.margin.left, pageHeight - 6)
        },

        margin: {top: 45}
      })

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      let nameSave = `Reporte_al_${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}.pdf`
      this.exportPDF = false
      this.disableButtonPDF = false
      this.disableButtonXLS = false
      this.textExport = ''
      doc.save(nameSave);

    },
    exportToExcel: function(exportFormat){
      let fecha = new Date()
      let wswt = XLSX.utils.json_to_sheet(exportFormat)
      let wb = XLSX.utils.book_new()
      this.textExport = ''
      this.disableButtonXLS = false
      this.disableButtonPDF = false
      this.exportExcel = false
      XLSX.utils.book_append_sheet(wb, wswt, 'resumen')
      let nameXLS = `reporteDel:${fecha.getDate()}/${fecha.getMonth()}/${fecha.getFullYear()}.xlsx`
      XLSX.writeFile(wb, nameXLS)
    },
    filterBodega: function (arr, bodega){
      let filt = []
      if(bodega === 1){
        filt = arr.filter( r => {
          return r['Ubicacion'] === 'En transito'
        })
      }else if(bodega === 2) {
        filt = arr.filter(r => {
          return r['Ubicacion'] === 'Telisa'
        })
      }else if(bodega === 3) {
        filt = arr.filter(r => {
          return r['Ubicacion'] === 'Sislocar'
        })
      }else if(bodega === 4) {
        filt = arr.filter(r => {
          return r['Ubicacion'] === 'Bodega 1'
        })
      }else if(bodega === 5) {
        filt = arr.filter(r => {
          return r['Ubicacion'] === 'Planta'
        })
      }
      return filt
    },
    exportReport: function(xlsOrPdf){
      this.disableButtonXLS = true
      this.disableButtonPDF = true
      if(xlsOrPdf === 'xls'){
        this.exportExcel = true
        this.xlsOrPdf = 'xls'
      }else {
        this.exportPDF = true
        this.xlsOrPdf = 'pdf'
      }
      let allRolls = []
      let ubicacionesTotal = this.ubicationSelected.length
      this.ubicationSelected.forEach ( u => {
                if (u === 'enTransito') ubicacionesTotal++
            })
            this.ubicationSelected.forEach( u => {

                if (u === 'enTransito'){
                    this.textExport = 'cargando rollos de transito ...'
                    this.db.ref('/sislocarEnTransito').once('value').then( sisEnTransito => {
                      this.textExport = 'Rollos sislocar en transito cargados ...'
                      let enSis = sisEnTransito.val()
                      for(let i in enSis) {
                          if(enSis[i].enTransito) {
                            enSis[i]['meters'] = Math.round(enSis[i]['meters'])
                            enSis[i]['kgs'] = Math.round(enSis[i]['kgs'])
                            enSis[i].ubicacion = 'En transito'
                            allRolls.push(enSis[i])
                          }
                        }
                      ubicacionesTotal--
                      if (ubicacionesTotal === 0) this.sendXLS(allRolls)

                    })

                    this.db.ref('/telisaEnTransito').once('value').then( telEnTransito => {
                        let enTel = telEnTransito.val()
                        this.textExport = 'Rollos telisa en transito cargados ...'
                        for (let i in enTel) {
                          if (enTel[i].enTransito) {
                            enTel[i]['meters'] = Math.round(enTel[i]['meters'])
                            enTel[i]['kgs'] = Math.round(enTel[i]['kgs'])
                            enTel[i].ubicacion = 'En transito'
                            allRolls.push(enTel[i])
                          }

                        }
                        ubicacionesTotal --
                        if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                    })
                }//end enTransito


                if (u === 'telisa') {
                    this.textExport = 'Cargando rollos de telisa ...'
                    this.db.ref('/telisa').once('value').then ( data => {
                        let telisa = data.val()
                        this.textExport = 'Rollos telisa cargados ...'
                        for (let i in telisa) {
                          telisa[i].ubicacion = 'Telisa'
                          telisa[i]['meters'] = Math.round(telisa[i]['meters'])
                          telisa[i]['kgs'] = Math.round(telisa[i]['kgs'])
                          allRolls.push(telisa[i])
                        }
                        ubicacionesTotal --
                        if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                    })
                }
                if (u === 'sislocar') {
                    this.textExport = 'Cargando rollos de sislocar ...'
                    this.db.ref('/sislocar').once('value').then ( data => {
                        let sislocar = data.val()
                        this.textExport = 'Rollos sislocar cargados ...'
                        for (let i in sislocar) {
                          sislocar[i].ubicacion = 'Sislocar'
                          sislocar[i]['meters'] = Math.round(sislocar[i]['meters'])
                          sislocar[i]['kgs'] = Math.round(sislocar[i]['kgs'])
                          allRolls.push(sislocar[i])
                        }
                        ubicacionesTotal --
                        if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                    })
                }
                if (u === 'bodega1' || u === 'planta') {
                    this.textExport = 'cargando rollos de inventario ...'
                    let inventario = []
                    this.db.ref('/Inventario').once('value').then ( data => {
                        inventario = data.val()
                        if ( u === 'bodega1'){
                            this.textExport = 'Rollos bodega 1 cargados ...'

                            for (let i in inventario) {
                                // console.log(inventario[i]['bodega'])
                              inventario[i].ubicacion = 'Bodega 1'
                              inventario[i]['meters'] = Math.round(inventario[i]['meters'])
                              inventario[i]['kgs'] = Math.round(inventario[i]['kgs'])
                              if(inventario[i]['bodega'] === '1') {
                                    allRolls.push(inventario[i])
                              }

                            }
                            ubicacionesTotal --
                            if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                        }
                        if ( u === 'planta'){
                            this.textExport = 'Rollos bodega planta cargados ...'
                            for (let i in inventario) {
                                inventario[i].ubicacion = 'Planta'
                              if(inventario[i]['bodega'] === 'Planta'){
                                inventario[i]['meters'] = Math.round(inventario[i]['meters'])
                                inventario[i]['kgs'] = Math.round(inventario[i]['kgs'])
                                allRolls.push(inventario[i])
                              }

                            }
                            ubicacionesTotal --
                            if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                        }
                    })
                }
            })
        }
    }
}
</script>
