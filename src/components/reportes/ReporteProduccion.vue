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
    <b-col cols="12" class="pt-2">
      <b-form-group>
        <h6 slot="label"><b>Agrupar por:</b></h6>
        <b-form-radio-group v-model="groupBy" :options="groupByOptions" name="radios">
        </b-form-radio-group>
      </b-form-group>
    </b-col>
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
        <v-icon class="ml-2" name="file-pdf" scale="2"></v-icon>
      </b-button>
    </b-col>
  </b-row>
</b-container>
</template>
<script>
import firebase from 'firebase/app'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { base64Img } from './logoBase64.js'

export default {
  name: 'reporte-produccion',
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
  data () {
    return {
      db: firebase.database(),
      groupBy: 1,
      groupByOptions: [
        {text: 'Fecha', value: 1},
        {text: 'Lote producción', value: 2},
        // {text: 'Tipor papel', value: 3},
        // {text: 'Estado (consumos / sobrantes)', value: 4}
      ],
      dateFilterBeginData: '',
      dateFilterFinishData: '',
      exportExcel: false,
      exportPDF: false,
      disableButtonXLS: false,
      disableButtonPDF: false,
      rolls: []
    }
  },
  methods: {

    exportReport: function(xlsOrPdf){
      this.disableButtonXLS = true
      this.disableButtonPDF = true

      if(xlsOrPdf === 'xls') this.exportExcel = true
      else this.exportPDF = true
      this.loadRolls()
    },
    exportToPDF: function(){
      let fecha = new Date()
      let head = [
        [
          'Fecha', 'Lote producción', 'Numero de rollo', 'Gramaje',
          'Ancho', 'Tipo papel'
        ]
      ]
      let body = []

      this.rolls.forEach( e => {
        let data = []
        let fecha = e.fecha
        let day = fecha.getDate() < 10 ? '0' + fecha.getDate() : fecha.getDate()
        let month = fecha.getMonth() < 9 ? '0' + (fecha.getMonth()+1) : (fecha.getMoth()+1)
        let fechaFormat = `${day}/${month}/${fecha.getFullYear()}`

        data.push(fechaFormat)
        data.push(e.loteProduccion)
        data.push(e.idNumber)
        data.push(e.gramaje)
        data.push(e.width)
        data.push(e.typePaper)
        body.push(data)
      })
      let doc = new jsPDF()

      var totalPagesExp = "{total_pages_count_string}";

      let colinas = "COLINAS ALTAVISTA S.A"

      let typeReport = ''
      let dbegin = this.dateFilterBeginData.split('-')
      let dfinish = this.dateFilterFinishData.split('-')
      let fechaFormat = `${dbegin[2]}/${dbegin[1]}/${dbegin[0]} AL ${dfinish[2]}/${dfinish[1]}/${dfinish[0]}`

      let nameReport = `${colinas}\n REPORTE DE PRODUCCIÓN\nDEL: ${fechaFormat}`

      doc.autoTable({
        head,
        body,
        headStyles: {
          fillColor: [204, 152, 62],
          halign: 'center'
        },
        /* columnStyles: {text: {cellWidth: 'auto'}}, */
        columnStyles:  {
          0: {halign: 'center', cellWidth: 'wrap'}, 1: {halign: 'center'}, 2: {halign: 'center'},
          3: {halign: 'center', cellWidth: 'auto'}, 4: {halign: 'center'}, 5: {halign: 'center'}
        },
        didParseCell: function(data) {
          if (data.cell.text[0] === '') {
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

      let nameSave = `Reporte_de_produccion.pdf`
      this.exportPDF = false
      this.disableButtonPDF = false
      this.disableButtonXLS = false
      this.textExport = ''
      doc.save(nameSave)
    },
    exportToExcel: function(){
      let fecha = new Date()
      let exportFormat = []
      this.rolls.forEach( e => {
        exportFormat.push({
          'Fecha': e.fecha,
          'Lote producción': e.loteProduccion,
          'Número de rollo': e.idNumber,
          'Gramaje': e.gramaje,
          'Ancho': e.width,
          'Tipo papel': e.typePaper
        })
      })

      let wswt = XLSX.utils.json_to_sheet(exportFormat)
      let wb = XLSX.utils.book_new()
      this.textExport = ''
      this.disableButtonXLS = false
      this.disableButtonPDF = false
      this.exportExcel = false
      XLSX.utils.book_append_sheet(wb, wswt, 'resumen')
      let nameXLS = `reporteDel:${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}.xlsx`

      XLSX.writeFile(wb, nameXLS)

    },
    loteToArray: function(lote){
      return (lote.toString()).split('&')
    },
    loadRolls: function(){
      this.rolls = []
      this.db.ref('HistorialInventario').orderByChild('loteProduccion').once('value').then( snap => {
        let data = snap.val()
        for (let key in data){

          let fechaArray = data[key].fecha.split('-')
          let day = fechaArray[0]
          let month = fechaArray[1] - 1
          let year = fechaArray[2]

          if (data[key].loteProduccion){
            this.rolls.push({
              'fecha': new Date(year, month, day),
              'loteProduccion': this.loteToArray(data[key].loteProduccion),
              'idNumber': data[key].idNumber,
              'gramaje': data[key].gramaje,
              'width': data[key].width,
              'typePaper': data[key].typePaper,
              // 'estado': 'consumida',

            })
          }
        }
        this.db.ref('InventarioSobrantes').once('value').then( snap => {
          let data = snap.val()
          for (let key in data){
            let fechaArray = data[key].fecha.split('-')
            let day = fechaArray[0]
            let month = fechaArray[1] - 1
            let year = fechaArray[2]
            if (data[key].loteProduccion){
              // this.info.push(data[key])
              this.rolls.push({

                'fecha': new Date(year, month, day),

                'loteProduccion': this.loteToArray(data[key].loteProduccion),
                'idNumber': data[key].idNumber,
                'gramaje': data[key].gramaje,
                'width': data[key].width,
                'typePaper': data[key].typePaper
                // 'estado': 'sobrante',
              })
            }
          }
          this.rolls = this.rolls.filter( el => {

            return el.fecha >= new Date(this.dateFilterBeginData + 'T00:00:00-06:00') &&
              el.fecha <= new Date(this.dateFilterFinishData + 'T00:00:00-06:00')
          })
          let rolls2 = []
          this.rolls.forEach( r => {
            for( let i in r.loteProduccion){
              rolls2.push({
                'fecha': r.fecha,
                'loteProduccion': r.loteProduccion[i],
                'idNumber': r.idNumber,
                'gramaje': r.gramaje,
                'width': r.width,
                'typePaper': r.typePaper,

                // 'estado': r.estado,
              })
            }
          })
          if (this.groupBy === 1) {
            rolls2.sort( (a, b) => {
              if (a.fecha < b.fecha) return -1
              if ( a.fecha > b.fecha ) return 1
              return 0
            })
          }else if (this.groupBy === 2){

              rolls2.sort( (a, b) => {
              if (a.loteProduccion < b.loteProduccion) return -1
              if (a.loteProduccion > b.loteProduccion ) return 1
              return 0
            })
          }
          this.rolls = rolls2
          if (this.exportExcel) this.exportToExcel()
          else this.exportToPDF()
        })
      })
    },
  }
}
</script>
