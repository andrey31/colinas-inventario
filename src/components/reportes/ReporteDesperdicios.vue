<template>
  <b-container>
    <b-row>
      <b-col cols="6">
        <b-input-group>
          <b-input-group-text slot="prepend">Fecha Inicio</b-input-group-text>
          <b-form-input type="date" v-model="dateFilterBegin"></b-form-input>
        </b-input-group>
      </b-col>
      <b-col cols="6">
        <b-input-group>
          <b-input-group-text slot="prepend">Fecha Final</b-input-group-text>
          <b-form-input type="date" v-model="dateFilterFinish"></b-form-input>
        </b-input-group>
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
  data () {
    return {
      db: firebase.database(),
      desperdiciosDiariosItems: [],
      exportExcel: false,
      exportPDF: false,
      disableButtonXLS: false,
      disableButtonPDF: false,
      dateFilterBeginData: '',
      dateFilterFinishData: ''
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

      this.loadDesperdicios()

    },
    exportToPDF: function () {
      let fecha = new Date()

      let head = [
        [
          'Fecha', 'Cantidad (Kgs)',
          'Turno', 'Centro (Kgs)', 'Falla mécanica (Kgs)', 'Golpes (Kgs)', 'Superficie (Kgs)',
          'Rollos afectados'
        ]
      ]

      let body = []

      this.desperdiciosDiariosItems.forEach(e => {

        let data = []
        /*  data.push(e['fecha']) */
        let fecha = e.fecha
        let day = fecha.getDate() < 10 ? '0' + fecha.getDate() : fecha.getDate()
        let month = fecha.getMonth() < 9 ? '0' + (fecha.getMonth()+1) : (fecha.getMoth()+1)
        let fechaFormat = `${day}/${month}/${fecha.getFullYear()}`

        data.push(fechaFormat)
        data.push(e.cantidad.toLocaleString('en-us'))
        data.push(e.turno)
        if (e.centro >= 0) data.push((e.centro).toLocaleString('en-us'))
        else data.push('')
        if (e.fallaMecanica >= 0) data.push((e.fallaMecanica).toLocaleString('en-us'))
        else data.push('')
        if (e.golpes >= 0) data.push((e.golpes).toLocaleString('en-us'))
        else data.push('')
        if (e.superficie >= 0) data.push((e.superficie).toLocaleString('en-us'))
        else data.push('')
        /* if (e.desperdicioPorRollo.length > 0) data.push(e.desperdicioPorRollo[0].numeroRollo) */
        if (e.desperdicioPorRollo.length > 0) data.push('Detalles al final')
        body.push(data)
      })

      let doc = new jsPDF()
      var totalPagesExp = "{total_pages_count_string}";

      let colinas = "COLINAS ALTAVISTA S.A"

      let typeReport = ''
      let dbegin = this.dateFilterBeginData.split('-')
      let dfinish = this.dateFilterFinishData.split('-')
      let fechaFormat = `${dbegin[2]}/${dbegin[1]}/${dbegin[0]} AL ${dfinish[2]}/${dfinish[1]}/${dfinish[0]}`

      let nameReport = `${colinas}\n REPORTE DE DESPERDICIOS DE ROLLOS\nDEL: ${fechaFormat}`

      doc.autoTable({
        head,
        body,
        /* styles: {overflow: 'ellipsize', cellWidth: 'wrap'}, */
        headStyles: {
          fillColor: [204, 152, 62],
          halign: 'center'
        },
        /* columnStyles: {text: {cellWidth: 'auto'}}, */
        columnStyles:  {
          0: {halign: 'center', cellWidth: 'wrap'}, 1: {halign: 'center'}, 2: {halign: 'center'},
          3: {halign: 'center', cellWidth: 'auto'}, 4: {halign: 'center'}, 5: {halign: 'center'},
          6: {halign: 'center'}, 7: {halign: 'center'}, 8: {halign: 'center', cellWidth: 'auto'}
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

      let head2 = [[ 'Fecha', 'Turno ', 'Cantidad (Kgs)', 'Causa', 'Numero rollo']]
      let nameReport2 = nameReport + '\n\n\nRollos afectados'
      let firstPage = true
      let body2 = []
      for (let i in this.desperdiciosDiariosItems) {

        if ((this.desperdiciosDiariosItems[i].desperdicioPorRollo).length > 0){
          if (firstPage) {
            doc.addPage()
            firstPage = false
          }
          // let body2 = []
          for (let j in this.desperdiciosDiariosItems[i].desperdicioPorRollo){
            let data = []
            data.push(this.desperdiciosDiariosItems[i].fechaAlt)
            data.push(this.desperdiciosDiariosItems[i].turno)
            data.push(this.desperdiciosDiariosItems[i].desperdicioPorRollo[j]['cantidad (Kgs)'])
            data.push(this.desperdiciosDiariosItems[i].desperdicioPorRollo[j]['causa'])
            data.push(this.desperdiciosDiariosItems[i].desperdicioPorRollo[j]['numeroRollo'])
            body2.push(data)
          }
        }
      }
      if (!firstPage){
        doc.autoTable({
          head: head2,
          body: body2,
          styles: {overflow: 'ellipsize', cellWidth: 'wrap'},
          headStyles: {
            fillColor: [204, 152, 62],
            halign: 'center'
          },
          columnStyles:  {
            0: {halign: 'center'}, 1: {halign: 'center'}, 2: {halign: 'center'},
            3: {halign: 'center', }, 4: {halign: 'center'}
          },
          /* startY: doc.autoTable.previous.finalY + 25, */
          didDrawPage: function (data) {
            // Header
            doc.setFontSize(16);
            doc.setTextColor(40);
            doc.setFontStyle('normal');

            doc.addImage(base64Img, 'png', data.settings.margin.left, 15, 25, 25);//imagen base64 en archivo aparte
            doc.addImage(base64Img, 'png', (doc.internal.pageSize.getWidth()-40), 15, 25, 25);
            let pw = (((doc.internal.pageSize).getWidth()))/2


            doc.text(nameReport2, pw, 22, { align: 'center', width: 100})

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

        margin: {top: 60}
      })
      }
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      let nameSave = `Reporte_de_desperdicios.pdf`
      this.exportPDF = false
      this.disableButtonPDF = false
      this.disableButtonXLS = false
      this.textExport = ''
      doc.save(nameSave)


    },
    exportToExcel: function () {
      let fecha = new Date()
      let exportFormat = []
      this.desperdiciosDiariosItems.forEach( e => {
        exportFormat.push({
          'Fecha': e.fecha,
          'Cantidad (Kgs)': e.cantidad,
          'Turno ': e.turno,
          'Centro (Kgs)': e.centro ? e.centro : 0,
          'Falla mécanica (Kgs)': e.fallaMecanica ? e.fallaMecanica : 0,
          'Golpes (Kgs)': e.golpes ? e.golpes : 0,
          'Superficie (Kgs)': e.superficie ? e.superficie : 0

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
    loadDesperdicios: function(){
      this.db.ref('/DesperdiciosDiarios')
        .once('value').then( snapshot => {
          this.desperdiciosDiariosItems = []
          let data = snapshot.val()
          for (let key in data){
            let fechaArray = data[key].fecha.split('-')
            let day = fechaArray[0]
            let month = fechaArray[1] - 1
            let year = fechaArray[2]

            this.desperdiciosDiariosItems.push({
              'fecha': new Date(year, month, day),
              'fechaAlt': data[key].fecha,
              'cantidad': data[key].cantidad,
              'turno': data[key].turno,
              'centro': Number(data[key].centro),
              'fallaMecanica': Number(data[key].fallaMecanica),
              'golpes': Number(data[key].golpes),
              'superficie': Number(data[key].superficie),
              /* 'desperdicioPorRollo': [ { "cantidad (Kgs)": 400, "numeroRollo": "000999" } ] */
              'desperdicioPorRollo': this.loadRollsByDesperdicio(data[key].fecha, data[key].turno)
            })
          }
          setTimeout( () => {
            this.desperdiciosDiariosItems =
              this.desperdiciosDiariosItems.filter( el => {
                return el.fecha >= new Date(this.dateFilterBeginData + 'T00:00:00-06:00') &&
                  el.fecha <= new Date(this.dateFilterFinishData + 'T00:00:00-06:00')

            })
            if (this.exportExcel) this.exportToExcel()
            else this.exportToPDF()
          }, 3000)

          /* for (let i in this.desperdiciosDiariosItems){

            this.desperdiciosDiariosItems[i].desperdicioPorRollo =
            this.loadRollsByDesperdicio(this.desperdiciosDiariosItems[i].fechaAlt, this.desperdiciosDiariosItems[i].turno)

            if (i == (this.desperdiciosDiariosItems.length)-1){
              if (this.exportExcel) this.exportToExcel()
              else this.exportToPDF()
            }
          } */
        })

    },
    loadRollsByDesperdicio: function(fecha, turno){
      let arr = []
      this.db.ref('DesperdicioPorRollo').orderByChild('fecha').equalTo(fecha).once('value').then(snap => {
        let data = snap.val()
        for (let key in data){
          if (data[key].turno === turno){
            arr.push({
              'cantidad (Kgs)': data[key].cantidad,
              'causa': data[key].causa,
              'numeroRollo': data[key].numeroRollo
            })
          }
        }
      })
      return arr
    }
  }
}
</script>
