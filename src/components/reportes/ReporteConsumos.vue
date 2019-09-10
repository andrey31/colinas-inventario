<template>
<b-container>
  <b-row>
    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend">Fecha Inicio</b-input-group-text>
        <b-form-input v-model="dateFilterBegin" type="date"></b-form-input>
      </b-input-group>
    </b-col>
    <b-col cols="6">
      <b-input-group>
        <b-input-group-text slot="prepend">Fecha Final</b-input-group-text>
        <b-form-input v-model="dateFilterFinish" type="date"></b-form-input>
      </b-input-group>
    </b-col>

    <!-- <b-col cols="12" class="pt-2"> -->
    <!--   <b-form-group label=""> -->
    <!--     <h6 slot="label"><b>Agrupar por:</b></h6> -->
    <!--     <b-form-radio-group v-model="groupBy" :options="groupByOptions" name="radios-stacked"> -->
    <!--     </b-form-radio-group> -->
    <!--   </b-form-group> -->
    <!-- </b-col> -->
    <b-col class="pt-4" cols="12">

        <b-button variant="success" size="lg" class="mr-2 p-2"
                  @click="exportReport('xls')" :disabled="disableButtonXLS">
          <b-spinner label="Spinning" v-if="exportExcel"></b-spinner>
          EXCEL
          <v-icon class="ml-2" name="file-excel" scale="2"></v-icon>
        </b-button>
        <b-button variant="danger" size="lg"
                   @click="exportReport('pdf')" :disabled="disableButtonPDF">
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { base64Img } from './logoBase64.js'
export default{
  data () {
    return {
      groupBy: 1,
      groupByOptions: [
        { text: 'Tipo papel', value: 1},
        { text: 'Totales', value: 2},
      ],
      db: firebase.database(),
      rolls: [],
      dateFilterBeginData: '',
      dateFilterFinishData: '',
      exportExcel: false,
      exportPDF: false,
      disableButtonXLS: false,
      disableButtonPDF: false
    }
  },
  computed: {
    dateFilterBegin: {
      get: function () {
        let date = new Date()
        let customDate = new Date( date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10).toString()
        this.dateFilterBeginData = customDate
        return customDate
      },
      set: function (v) {
        this.dateFilterBeginData = v
      }

    },
    dateFilterFinish: {
      get: function () {
        let customDate = new Date().toISOString().slice(0, 10).toString()
        this.dateFilterFinishData = customDate
        return customDate
      },
      set: function (v){
        this.dateFilterFinishData = v
      }
    }
  },
  methods: {
    exportReport: function(xlsOrPdf){
      this.disableButtonXLS = true
      this.disableButtonPDF = true

      if(xlsOrPdf === 'xls') this.exportExcel = true
      else this.exportPDF = true

      let sobrantes = []
      this.rolls = []
      this.db.ref('/InventarioSobrantes').once('value').then( snap => {
        sobrantes = snap.val()

        for (let i in sobrantes) {
          // sobrantes[i]['meters'] = Math.round(inventario[i]['meters'])
          // sobrantes[i]['kgs'] = Math.round(sobrantes[i]['kgs'])
          sobrantes[i]['kgsConsumidos'] = Math.round(sobrantes[i]['kgsConsumidos'])
          this.rolls.push(sobrantes[i])
        }
        this.db.ref('/HistorialInventario').once('value').then( snap => {
          let inventario = snap.val()

          for (let i in inventario){
            inventario[i]['kgsConsumidos'] = Math.round(inventario[i]['kgs'])
            this.rolls.push(inventario[i])
          }

          this.rolls = this.rolls.filter( el => {
            // console.log(el.fecha)
            let fe = el.fecha

            let fechaArray = fe.split('-')
            let day = fechaArray[0]
            let month = fechaArray[1] - 1
            let year = fechaArray[2]
            let fecha = new Date(year, month, day)

            return fecha >= new Date(this.dateFilterBeginData + 'T00:00:00-06:00') &&
              fecha <= new Date(this.dateFilterFinishData + 'T00:00:00-06:00')
          })


          let exportFormat = null
          if (this.groupBy === 1) exportFormat = this.formatByTypePaper()

          if(xlsOrPdf === 'xls' ) this.exportToExcel(exportFormat)
          else this.exportToPdf(exportFormat)
        })

      })
    },
    exportToPdf: function(exportFormat){
      let fecha = new Date()
      let head = [
        [
          'Tipo papel', 'Gramaje-Ancho', // 'Cantidad de rollos',
          'Kgs consumidos'
        ]
      ]

      let body = []

      exportFormat.shift()
      exportFormat.forEach( e => {
        let data = []
        data.push(e['Tipo papel'])
        data.push(e['Gramaje-Ancho'])
        // data.push(e['Cantidad de rollos'])
        data.push(e['Kgs consumidos'].toLocaleString('en-us'))
        body.push(data)

      })
      let doc = new jsPDF()
      var totalPagesExp = "{total_pages_count_string}";

      let colinas = "COLINAS ALTAVISTA S.A"

      let typeReport = ''
      if (this.groupBy === 1) typeReport = 'agrupado por tipo papel'
      if(this.groupBy === 2) typeReport = 'agrupado por totales'

      let dbegin = this.dateFilterBeginData.split('-')
      let dfinish = this.dateFilterFinishData.split('-')
      let fechaFormat = `${dbegin[2]}/${dbegin[1]}/${dbegin[0]} AL ${dfinish[2]}/${dfinish[1]}/${dfinish[0]}`

      let nameReport = `${colinas}\n REPORTE DE CONSUMOS DE ROLLOS\nDEL: ${fechaFormat}`

      // Or JavaScript:
      doc.autoTable({
        head,
        body,
        styles: {overflow: 'ellipsize', cellWidth: 'wrap'},
        headStyles: {
          fillColor: [204, 152, 62],
          halign: 'center'
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
          let day = fecha.getDate() < 10 ? '0' + fecha.getDate() : fecha.getDate()
          let month = fecha.getMonth() < 9 ? '0' + (fecha.getMonth()+1) : (fecha.getMoth()+1)
          let str2 = `Generado el ${day}/${month}/${fecha.getFullYear()} a las ${hour}:${minutes}:${seconds} ${typeReport}`
          doc.text(str2, data.settings.margin.left, pageHeight - 6)
        },

        margin: {top: 45}
      })

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      let nameSave = `Reporte_de_consumos.pdf`
      this.exportPDF = false
      this.disableButtonPDF = false
      this.disableButtonXLS = false
      this.textExport = ''
      doc.save(nameSave)
    },
    exportToExcel: function(exportFormat){
      let fecha = new Date()
      let wswt = XLSX.utils.json_to_sheet(exportFormat)
      let wb = XLSX.utils.book_new()
      this.textExport = ''
      this.disableButtonXLS = false
      this.exportExcel = false
      this.disableButtonPDF = false
      XLSX.utils.book_append_sheet(wb, wswt, 'resumen')
      let nameXLS = `reporteConsumosDel:${fecha.getDate()}/${fecha.getMonth()}/${fecha.getFullYear()}.xlsx`
      XLSX.writeFile(wb, nameXLS)
    },
    formatByTypePaper: function(){

      let groupByTypePaper = this.groupByTypePaper()

      let cpWt = (groupByTypePaper.wt).slice()
      let cpMedium = (groupByTypePaper.medium).slice()
      let cpLiner = (groupByTypePaper.liner).slice()
      let exportFormat = []

      let wtPesoTotal = 0
      let mPesoTotal = 0
      let lPesoTotal = 0

      // let fecha = new Date()
      let dbegin = this.dateFilterBeginData.split('-')
      let dfinish = this.dateFilterFinishData.split('-')
      let fecha = `${dbegin[2]}/${dbegin[1]}/${dbegin[0]} AL ${dfinish[2]}/${dfinish[1]}/${dfinish[0]}`
      exportFormat.unshift(
        {
          'Fecha de reporte': fecha, 'Tipo papel': '',
          'Gramaje-Ancho': '', // 'Cantidad de rollos': '',
          'Kgs consumidos': ''
        }
      )
      if (cpWt.length > 0) {


        cpWt.sort( (a, b) => {

          if (a['Gramaje-Ancho'] < b['Gramaje-Ancho']) return -1

          if( a['Gramaje-Ancho'] > b['Gramaje-Ancho']) return 1

          return 0
        })

        cpWt.forEach( wt => {
          // wtRollosTotal += wt['Cantidad de rollos']
          let p = wt['Kgs consumidos']
          wtPesoTotal += Number(p)

          exportFormat.push(wt)
        })

        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '**Total kgs**', // 'Cantidad de rollos': wtRollosTotal,
            'Kgs consumidos': (wtPesoTotal)
          }
        )
        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '', // 'Cantidad de rollos': '',
            'Kgs consumidos': ''
          }
        )

        // exportFormat.push({})
      }
      if (cpMedium.length > 0) {

        let rollosTotal = 0


        cpMedium.sort( (a, b) => {

          if (a['Gramaje-Ancho'] < b['Gramaje-Ancho']) return -1

          if( a['Gramaje-Ancho'] > b['Gramaje-Ancho']) return 1

          return 0
        })

        cpMedium.forEach( m => {
          // rollosTotal += m['Cantidad de rollos']
          let p = m['Kgs consumidos']
          mPesoTotal += Number(p)

          exportFormat.push(m)
        })

        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '**Total kgs**', // 'Cantidad de rollos': rollosTotal,
            'Kgs consumidos': mPesoTotal
          }
        )
        exportFormat.push(
          {
            'Fecha de reporte': '', 'Tipo papel': '',
            'Gramaje-Ancho': '', // 'Cantidad de rollos': '',
            'Kgs consumidos': ''
          }
        )
        // exportFormat.push({})
      }
      if (cpLiner.length > 0) {


        let rollosTotal = 0

        cpLiner.sort( (a, b) => {

          if (a['Gramaje-Ancho'] < b['Gramaje-Ancho']) return -1

          if( a['Gramaje-Ancho'] > b['Gramaje-Ancho']) return 1

          return 0
        })

        cpLiner.forEach( m => {
          // rollosTotal += m['Cantidad de rollos']
          let p = m['Kgs consumidos']
          lPesoTotal += Number(p)

          exportFormat.push(m)
        })

        exportFormat.push({
          'Fecha de reporte': '',
          'Tipo papel': '',
          'Gramaje-Ancho': '**Total kgs**',
          // 'Cantidad de rollos': rollosTotal,
          'Kgs consumidos': lPesoTotal,
        })

        let granTotal = wtPesoTotal + mPesoTotal + lPesoTotal
        exportFormat.push({
          'Fecha de reporte': '',
          'Tipo papel': '',
          'Gramaje-Ancho': '**Gran total kgs**',
          // 'Cantidad de rollos': '',
          'Kgs consumidos': granTotal
        })
        // exportFormat.push({})
      }
      return exportFormat

    },
    groupByTypePaper: function () {
      let totalRolls = this.totalRolls()

      let filter = {}
      let wt = []
      let liner = []
      let medium = []

      totalRolls.rollsByGramaje.forEach( el => {
        let typePaper = (el.tipo).split('-')
        if(typePaper[1].includes('WHITE TOP')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'WHITE TOP'
          wt.push(el)
        }else if(typePaper[1].includes('LINER')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'LINER'
          liner.push(el)
        }else if(typePaper[1].includes('MEDIUM')) {
          el['Gramaje-Ancho'] = typePaper[0]
          el['Tipo papel'] = 'MEDIUM'
          medium.push(el)
        }
        delete el.tipo
      })

      filter['wt'] = wt
      filter['liner'] = liner
      filter['medium'] = medium
      return filter
    },
    totalRolls: function (){
      let total = {}
      total.length = this.rolls.length
      let rollsByGramaje = {}

      this.rolls.forEach( roll => {

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
          let keyGramajeType = `${key} en ${roll.width}-${roll.typePaper}`
          rollsByGramajeType[keyGramajeType] = rollsByGramajeType[keyGramajeType] || []
          rollsByGramajeType[keyGramajeType].push({kgsConsumidos: roll.kgsConsumidos})
        })
      })

      Object.keys(rollsByGramajeType).forEach( key => {

        gramajes.push({
          'tipo': key,
          // 'Cantidad de rollos': rollsByGramajeType[key].length,
          'roll': rollsByGramajeType[key]
        })
      })

      let gramajesAlt = []
      gramajes.forEach( el => {
        // let peso = 0
        let consumido = 0
        for (let i in el.roll){
          // peso += el.roll[i].kgs
          consumido += el.roll[i].kgsConsumidos
        }
        // el['Peso total (Kgs)'] = Math.round(peso)
        el['Kgs consumidos'] = Math.round(consumido)
        delete el.roll
        gramajesAlt.push(el)
      })

      total.rollsByGramaje = gramajesAlt

      return total
    },
  }
}
</script>
