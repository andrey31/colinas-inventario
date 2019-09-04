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
                    'Gramaje-Ancho': '',
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
                if (u === 'telisa') {
                    let cpWt2 = this.filterBodega(cpWt, 2)
                    let cpMedium2 = this.filterBodega(cpMedium, 2)
                    let cpLiner2 = this.filterBodega(cpLiner, 2)

                    let enTelisaAll = cpWt2.concat(cpMedium2, cpLiner2)

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
                if ( u === 'sislocar'){
                    let cpWt3 = this.filterBodega(cpWt, 3)
                    let cpMedium3 = this.filterBodega(cpMedium, 3)
                    let cpLiner3 = this.filterBodega(cpLiner, 3)

                    let enSislocarAll = cpWt3.concat(cpMedium3, cpLiner3)

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
                if (u === 'bodega1'){
                    let cpWt4 = this.filterBodega(cpWt, 4)
                    let cpMedium4 = this.filterBodega(cpMedium, 4)
                    let cpLiner4 = this.filterBodega(cpLiner, 4)

                    let bodegaAll = cpWt4.concat(cpMedium4, cpLiner4)


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
                if ( u === 'planta') {

                    let cpWt5 = this.filterBodega(cpWt, 5)
                    let cpMedium5 = this.filterBodega(cpMedium, 5)
                    let cpLiner5 = this.filterBodega(cpLiner, 5)

                    let plantaAll = cpWt5.concat(cpMedium5, cpLiner5)

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

            let day = fecha.getDate() < 9 ? '0' + fecha.getDate() : fecha.getDate()
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

                    let base64Img = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTEhIWFRUXGBgaGRgYGR8ZHhogGRgZGBsaGxgYHSggHRomHxgdIjEiJykrLi4uHh8zODMsOCgtLysBCgoKDg0OGxAQGy0lICYtLS01LS0vLS0xLy0tLS0tLS4tLTU3LS0tLi0tLS0tLS8tLS0tLS0tKy0tLS0tLS0tLf/AABEIANMA7wMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xABKEAACAQIEAwUDCAYHBwQDAAABAgMAEQQSITEFQVEGEyJhcTKBkQcUIzNCUlOhFkNVYrHBJHKCkrPR8BVUc6KywvEXNGPSNZPh/8QAGgEBAAMBAQEAAAAAAAAAAAAAAAECAwQFBv/EADERAAIBAwMCAwYFBQAAAAAAAAABAgMREgQhMUFRE2GRMnGSobHRIlKBweEFFDNC8P/aAAwDAQACEQMRAD8A7jSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAVRG7SYnA4/uOIMHwmIa2GxWULkb8GbLYA9G0vv1yXiUmxyi5sbAm1zyF+VVeSSLGxyYLHRi7aEHS/QqfsuNwfQisp1owkoy6llBtNroWulc97McZl4fiF4XxByytpgsS20qjaJzylW4HnoOa5r3jcUkUbyyGyRqzsegUFifgK1Kmnx/tBhsFH3uKmWJeV92PRVF2Y+QBqu/8AqRBe5wfEBHv33zV+7t1v7VvdVRwEzyFeIT2OLxCd7GSM/wA0gYkRJCpBHeOAWL2v5Xa5sJ4Ljsve/S9cvzmQyemW+X+zm93KuaeotJxjFytzboaRp3V27Fw4Dx7DYyPvcLMsqcyp1B3synVT5EA1JVxyPGFcZHPAjjF5XEpRQqzpmZVOIjsozgqwGUZyVbwgLcTp+UOTunPdASxkZ1yg+1bL4RLbxZgQ2cggNsQRWyqJq5VxaOjUrm7fKFOglEkShkiea+XQpGuZioWU5iLqLEofEpFxrXrDdu8SXSJ4kVpfYJXw3B8QOWZiWChjbQHK1mJFqZoYnRqVQV7cSfMPnlktmv8AVn2Pmvzj2O99vl7dq84nt1NmWGKHvJtc1l09plBs0gyg5TYZmY5WIWwuWaGLOgUqmYTtZN3E0k8axtGBqdApYkeJQ7aBVLnxA23ArW4b25kkwk0xQK8ZF1ZCpAucwZO8PiAAb2gLOlTkiMS+Urm8PygzqqSzQAQsAc1goUG1ixEzEDUXIVgOZA1rd4j24kaUxYWEsVALZluVuCQGGcWJsSAM2gucoIJZonFl7pXPP/UZu4uIT33eCPLYe0SoC5c9rnOrA58mQ5s3Kpvsnx+fEOyyxqAFvcaaHLlNszXDXa18p8B0IINMkRiWiq5xPtxgYSVacMw5Rgv+a6A++or5W8bJHhFWMlVkkCuRzGVjlv0JH5W51yLAsBItxcZh/Eai2/pUSlY87Vax054RXqdZf5VMIDYRTnzyp/8AepHAfKDgpGys7Qt0lWw97AlR7yK5hhezDKFfEzLBcjKN3J8gDv8AE1rY/wCZliVknYk3JyLa53NmIO+tVzZl/caiKvOy8nt/J+gUcEAg3B1BHOvVcb7Adqvm0qwPKWw7m3jGXuydmGpAUncX53637GDetE7ndQrqrG6PtKUqTcUpSgFKUoDFicQkal5GCqNSzGwHvNU7jHGIMSudMPi2AtlnTDuVsStjawd0sxa6qfZa2tgZDjaCfH4bDSaxLFJiWW+kjRvGkasM3iVS+exX2ljIJ1AiOO/KWmG4pFw04Z27xolMua1jKQFypl8Si4ucw5721pUpxqRcZK6LRk4u6MPzjDcUwpwuKYMD9XMD4kcDTU6pKt7EGx1IYam+knFcS2HxfBscb404aZcPLsMWpjYKQfxPvDfc8jU92g4RH8+hK+H50siyW5vGgeOS1tTlDIdswya+ECovtJwgYiMYXFsY5Iznw2KX2onHssG0JW4F9QfQgEcsaktO8KjvHpL9n9zVxVRXjz2+xEcMxoeHBToMymDCuALathiqyxi+lwUA1++KzpgrcYPE/wDaaHD5f/b5m70/R5e57joD47Wvfl9qqtg8dPhZpMPOkZkZw8mFdxCsjnw/OsFiDZFL84za/iABvlSdXiQJyjBcXLbW+bxf41+7y+dqs4Vac5Omk0999rP90RlCSSl0MnCONLhsfLiJEbu5APFYeEr3ilGa+VWsQwuQpzSAEkWMZxPNO2MlVGVZe7CWU5tJpJCwBG301gSPFkY7Wvb+znZ2eaWOfGKuGhiDdzhEkzsS/tPiJgfG3MKNNuhvcm4ZhioQxRZQSQLCwJ3NuvnW0Yysr8lHJHGeIYCRRiRZ5C2DmZWIBIHdNmiHdoq2bvYn0UEkG5bKttiDCvFNC7NJIpDasBdCjAk/RooGdYZQSwLeFQGsxB65JwnCta8MRsAo0GgGwHkKPwnCkBTDEQt7DKNLm5t6nWmDGSOODF24X8xyN3/s5baD+jfNcxP4X6zvPYyc76VuSu0OJnMkbKJu7dWK+zZY1KtoQjWiDLnspEjDdSD1iPhWFBBEUQsbjQWBHMDa/nWbF4WGS3eIjkbEgEj0O4qcGMjic6TSwul2YPMYw7Rj6vuYpJCREsYdbCeMEWuXABG42sbgcVFNiklAJlhLnIhUZkRUZbd4+rKYCCGt9G2gIN+pyYLAxsCUgVrgjRb3BuD1351nkwuEnOcrFIdBm0Y6a2v5XpgxkcrxnFBLwxMHGhaRkIzEHKveQmO7MAcmXvCTmsTbKoYnSQ4HxUYHGYhp43AcgqSLHxRwJlZmsqsDCDlJuVdSL2NdIg4dh0YMscYYbNYXHodxXvFYOCQguiMRoCbXt0vvbyqcWRdHGoTHI2IkmVkjldDbKysvdoio9jlZAXUlSxjIVYzcXANp+TPESd/KgZ3htdWcanRTe9hnszMBJ9rxatkzVeW4fhyqoY4sq+yLDw33I6H0rLhYIowRGqICbm1hc9T1NQosORj43wqPEwvDKPCw3G4I1DDzBrk8XBRw4TTT5XkRikQ5E8m8ienIA11fiXEAi2U3Y7eXmap/arshNi4UaOQd4pY5GOjXtz5P69eVJb8HLXpbeIleS4/7yOY413nPeklmOjDn4baqPu6jQba8q8YTDS4lxHHH3kh+6NT1LHa3Vj7zVmwHyc492CuqxKDfMzhveAhJJ0HSun9mOzMOCQhLs7e3I3tN/kPL+J1qFFs8ulo6lWV53S63OWcR+TzFwwNOxjOQZmRWJYAak+zY2Gtr/Grz8ks8rYIiS5VZGWMn7oC6DyDXH5cquOIhDqyNswIPoRY15wmFSJFjjUKiiyqNgBV1GzPQpaSNKplHixmpSlWOwUpSgFKVgxOFV7Zi4t912T45GF/fQET2i4dKZIcVhgDNBmGQmwljkAzxFifCcyo4bWxTaxNRsvazA5lkmw86YhF0D4SVpUBXMQHSNhte+Vrda2+0DCEIkKyyzytljQ4mZV6s7uGbKirdibG9gBqRWvF2VxGjycQlMlwbKid3oVOW0geQpddjJzO3KNyTY4XHJPifnc69yEVo4YWPjGcqWeTK2XO2UAL4rAAg3JqX4hhYpkyPY72N9QRoSD5c/wA6g+BuRKcJi40EyoGjkU2WdNi6qTmWRWJuovkDLZrNU1iMJAilnUBRa5JPIW/MaEc9jeqzScWpWsStnsVXinAGKd3LFDi4RqqyAMVvoCtzmUnbwmq6ewfD7/8A4jW9tJZ997Wz/lVrlx/eEjD4YFRe7PtqLG4JCgWAsCdLDQWrTOKb8bCjl9al973vnvmvrm3868pSttRlO3krr9G0dVvzpX9PoV79BOHfsjlf66fbr7e1ff0D4f8Asg8h9dPz2Ht1YBjG/Gwm4P1kfLXbNtfW219d6+DFt+NhOn1qef724ubHlc2tU51u8/hQxh2j6sgP0E4d+yDz/XT8t/t8qfoJw79kHl+un57fb51P/O2/FwnL9anIW+9zGh6jQ3ocW34uE5/rU56EWzWI0GmwsLUzrd5/ChjDtH1ZAfoHw/8AZB3t9dPva9vb3tWHFdgsCV8HDMh3zd5M+g30L2t5/wDmrL87b8bC7W+tS+973zXzX1zb+dffnjXv32E3B+sj5a7Ztr622vrvTOt3n8KGMO0fVmjh8C8SZUgKBdgqZVHS62/mKycd4DhsZDDLiMKsrq+XKLoWBB5xkHTf3V6xWIdgFDQMOeRg2gN7EqTboCdgWA0uKQ4tnCN32HyAHIrTJ9rckBhuDax5E33tXVTnNU3KTk+i2V1+n3MpKLkkrepD/oJw79kHa/10+3X29qfoHw/9kHe310++9vb3tVg+eN+NhN76yofO2rezcA5dgQDavgxbfjYXa31qX3ve+a977HcVy51u8/hRrjDtH1ZX/wBBOHfsjqfrp+W59vlX39A+H/sg8v10/Pb7dWAYxvxcJy/WJy20zbeW1fBi2/Gwn/7U9PvcgbDoNrUzrd5/ChjDtH1ZGQ9luHhck2AnSM+EAYjEFelshkAt5D4Va+zmGwGBiMOEUxRs5craVrsVAJu9zso08qjcPKGNnxWFjXqHQnbLp4tLjQm+ul71MYXhMMozR4gyDYlSjC+hOoUi+xt6HfWuilOvbq/ekn9V9DOap3+xv/7ag++f7jf/AFrejcMARsRf/V6iP0fX8ST/AJfX7vXW+96zdz83IZfqzZXHQ6ASC2g6Ny56WN+mEqn+6/71ZlJR6EnSlK2KClKUApSlAKUpQFa4gcnFcK76I+HxEKHl3heGTLfLYMyRsRdjfIbAWJMDx/snxKXjEGLhxmTCoYy0edgQF9tBGBlbPrqT9ryFXfi3C4sRH3cy5luGGpBUqbhlZfErDkwIIqu8QgxmHjt/tIFdlL4dHlPh0swZUJBtqU23JOtVlJRWUnsSk27IydocdGuPwl2s0Uc8j2OoRwI1UqHBId9tGF49gQGEbx3iymJ8Xi3MWEj2Ue055Ko+052vy18zWDAcMjhilxmMkYQi8kjytmeTQAEkAcgqgKovoFA0qLhSTGxycYxURTDYaKSXA4U8wiFlnkXYscoyjYaW0sTx4y1LvLaHb83v8vLqbXVLZe19P5IjBcMxfFnbv4vApGXDM7R4fCg6qJu7s8+JIIYoCuW/iZcwQWYfJgFFwvD2I+y2CIU+WYTlh6kn0q4dnMGuFwUakk5Y88jbl3IzyOerMxJ99cq7MfLbNiOIRwSYaNYJpFjTLm7xC7BULMTlbUi9lH5a9qVtkYFs4N2a4a8jYfEcLw8GJVc2SwdJFvbvInsMy3IBBAZSRcagmZfsDwoC5wOHA6lAK99uUyxRYldJMPPCynnleRYZV9GjkYW626CtT5TeJNHhhHGQJJGCrfbMWVIyfISPGT5BqN2JRl/QfhFs3zPC22vlW3pevP6FcH/3TC/Ba583EGTAYuAyuzwmYq7HxnLhpHR2PKTu3hvzzI/S9THG+B/0J8UJnS3fWWNnjNwXUEtHIA1igIBU7nrVM2WxLT+hfB/90wnwWseO7F8KSF5FwOGaykjwixI86oj4LLDhws0rSYlo0GaSR3QsShZWd2s2TvnGUDxIvQVbuzMb/M5cJOQZVUsjEghzGdH8ySiyMDqDIQdqnJkYmDspwLDu0/0EMeH8N+7AVJbrbK1mPsm9+oZeV7zKdiODnbB4U210VTVAj4vKuDmwysS5mCI7G5Jcr3DMTqSElgck/hPe9YJ5JG78RtIcggCXN2C5Uz6yXXOVBN20L5SdbGozJxOiL2N4MdsLhD7l/wA6+/oXwf8A3TCfBapPCsNFPHKqzSq0YMjKz4hZbqpPd5nlEkYIJbKdG0IDZb1H4OPusG+IaWSRg8qBJZXcMUnkEftvlW7JHHfLfx+dM2MUdKi7B8JbVcDhmHkoP8K8zdh+EJbPg8Kt9syqL/GoP5M8S0U02EklaUrazubs11zqTfW5vKvpEtQfa1nXGynEtMkf2XRnUL9JJYu0LKwXIYspY92LSXIa9TkRiXwfJ/wv/cMP/cFSvA+G4XDoY8IkcaFsxWO1rkAXIHOyge6oaHGJBwwurgaPdhoELMcx15JcnpZb1Tvk94i8WLQSM1sRGJVVj9WJGsYl/dQmBQOryedmQsdcrxLGGBVhcEEEdQdCK9MdDbU1DPxV0gY5XeYKTYxsgBtsSdAoPnqNrnezdiEiQ4W5MSZjcgWJ6lfCT7yL1tVG4J3AijVGCqLOXAGykaWOrFrG4uLX12qSogxSlKkgUpSgFKUoDxKTY5Rc2NgTa55C/KqzDgSc2KxzBVQFsrGyqF1JbkFHTnzq01R+1nAMVxDELDN9Fw2KzuAwz4ll1CsF9mIH3m3WxXGrQjUknLhdOn6l4zcU7EZgcM/HJ1xEyleFwteCJhb5y66d7Ip/Vjkp3+NdFxeGWSN43F0dSrDyYWI+Br5gEAjQKAAEUADQAACwA6VnrYoVjsxxGSOD5viFbvsMFjdyCEkUC0cytY3EgA8IuQ2ZbaVG8H7H8Lw+J+dJgzDLmOUsWKKxvfIMxRfIWGXotrDfxuMZ2YbKJCdDqShspvyHhBA66+mrHgBiJFSWacJZ7LHK0dyTnYMyWcg2P2uXnVclexbF2ubPHpxjMRHgojmWOWObFMNQgiYSxxX27x5FQ5dwgYm11vqdp+zk2LxcbMv0MbDQ5SGGUrmN2uCveSEDKbkR6i1WzhvDosPGIoI1jQbKosNdyepPMnU1tVLVyE7HM+L9gHMmIEC5Y5YTGMoTco6q5u6kle+kW3MBNRasj9nOIPE8MhBjZWACLkylybtZsU4I8THLYakaiukVgxuKWJC7HQfmToAPMnSq4InI51geyc4nhZt4BmUHLYElcj6OfwnW1tO9c367a8NmTGZyWKlQqrcEIqxSDQ5ri65Li1rqSPaqSOIcszFiGbex+A9ANK2+GRXMrHUiL45wT/2j4mqLsiz7lB7I9mnxUkc9z3SFUdfDlJVWGcnNmzCKd47Wtqpv4bVNS9lcYss0sQAd2BUm1ly+HQLKpbMt9CVtfnzkvkmH9Ek/4x5//FEP/wCe69XapjG8URKVmznXB+x+JBmmmy940RVEUBB7MoAsHcDWZySW5qAFC6xU/ZGZe7icEjvHkAISxHevJZryEKFeWI883dgc7V1qsbwqWDEXK3sel7X/AIf6vVsERkcyj4b3WKTE4WNlUKPAcgzaowDMH0t9IAbNpKw0sKzcR4Nj8QWMTJ3cjOSSucoSTqM0ygEAgWyEEAXzjew8UjCzOBsSDboSAT+evvrc7P4lVLRk2LG6+Zy2IHnZb26X6G1EvxWLPi5Tp+xOJ7o4ax7kJGgCsCLL4XF2kU3aL6O+QW1Yb1u8R7DkPh5IVsyC8mTKtyUKsoOZcoJZWFr5TEunOuhVrpjoyWUSKStswBva4uL220q+CK5ER2OwWJiiIxT5mLXH58s72FrC2Y7E6XtUtxOItFIqi7FGt62NvzrZpVrbWIvuY4JQ6hlNwwBB8iLislReIw00bXw5XIbkxsL2J1zIQwsCdxfzHQ5+E4Z40tI2ZizMbbAsSbDyF6Jixu0pSpIFKUoBSlKAVXu2XaaPBQ3bxSPcIl9+rH90f5Ct7tJxX5thpJgjOVGigE69TbZRuT0rguNxkmJd5ZWLPqxb/tt06Afw2rKVji1eq8JYx5ZbZu3WLwuJkjzLLGG0RxaynUBWWxGhG96vfZDthHjsyrG8boAWBsV100Yb+8CuO45O/CSqQXIVHUmxzKuUHXTxKt/UHpXrs9xR8HiEnUggGzhWU5lPtCynpqPMCs4yaOKGrnCru7xb+R1EGvUUmVle18rA2/I++xNvO1eQRrbUXIB6gEgH30qvU+g5RckYEAg3B1B616qH7PYsZe6J8S3K+a32Hpe1ulvdMVuncyasKgeO8RBJgUi4sZPIHUL79/T10keLY5YkJLAMdEBF7sdB4bi+pHMeoqHwXDHbxSnfUnmx6+VRJ9ETFdWY8FhM9ydFAOvnatjgsZZMRIGvnGQL0KBr297Wt5Vu40hIWtoAp919Ky8EgCwJYWzDOfV/EfzNVirMmT2Kx8kw/okn/GP+FF/491XaqN8kTD5pIP8A5b/GKK38PharzVoeyiJcsV8ZrC50Ar7UTx7Eiwi+/qTrYKCL26nlbz15Ay3YqRCxtIxc7MSS2wtcgHXlYaDfSveGP06Zdhrm2ACABiel7/nXjG4666kJGovqbAADcmo8YiXSRcLI8Y6nuy1xuobU89GtfptWS3Zq9kTeMxErSQ3XNE5YMtvY8DOjtrqPBlIt7TLbavUeCCzPMLXeONCNvq2lYHz+tt7vh5wvFI5EDx5mG5AHiHI+Dc2OhAubgjfStjC4pJATG4YA2Njex6Ebg+R1rcyMmFORlt7JNiOWuxA5G+mm99dqlqgOJQZ1AJIsynRspJU3UAj94DTna1TeHlDKGBvf+PMW5G/KoBkpSlAKUpQClKUApSlAUb5WuIZMKkIYKZn1ubeFBmbbXfLXJ5GVQgW5BuzE6X1KWt6Buf2q6l8sGFDYeBgmaTvgikC7WZHOUepUaDewqo8N7E4wy4cSwFUzpmNwbKSXOYAm1gDvzZRzrKV2zxtXCc6zSXYhcMojCqQQJTlLHQWGiup+6G1vzy1pTwSKxzKwa51A5g8iul79K752h7Ow4uIxSLbcqw3QnmP5jnXFu0mCnwsrRTCx0IcXs9tM49RYEdRrrUONimp0zpR34L3wriDTRpOSPH4ZBtkeMANpyzEhvQ+VS4gJF18Q523HqP51BfJPhBJh8Suc5XIVktqpsbOp8wem6VOQSGGVox+rsPVT7J9bCjW1z2dJUc6Sb5MYOxBII1BG4PUVOYTja5bS3VhzCkg+Ytcj0P51q8RCFQ6ga8xpr5i1v4Go2ibidDSZJ4X+kP3rOSm6RmwI82TcHlrrvte1S9VRkB3APrXpJXX2JGHkSWHwbl6WqcxiTfGvqiOthUu63BHWq7iMcJYiLZZBrl5G33Tz9N/Kqz2g+UiZHSDDYVGmmBMbSSHKijd5Aq8tNAff1OrCL3fP7EYNrYkvkljthJDYC82noIoxb3G4q71x7sZxnHYX+hPGhLlmjljVmzkKuZbE6OFAO2ov0qyYnEY0gs7TKo527sD3qBXO9XGCSUZS9yui/guT3aXvLziJ1RSzGwH+rAcydrVUOK8SXxTTMsaAbsQAo5XO1/8AxrYVG4IyMc7F200Dk8/tEvr8ATqb71khKO3gXv5EZh4Rmyt9oZjolttxsRvWsajnFNq3kRgovkrWN7WiSWJEglWIksJJkaNZGUXVUDC5t7ettUFS3DOLZmYzyMFGUBEIF7m27H2R5mpHGYPwv3x1t4stmCga5VzAg7am2pHKwtD8S4qmDyRy4kqGC6zRGVRe4AaVMtrlW1ck6E7CtIyXBVpmThuB7nGYibDL3iEIGS+QMQPaS1lEwGl9L23XUmzYfDQYr6RcrOvhPeJ9JHscucFXXlvfkelR3D8b4DdQpVguVSLXIDDKdBkKsGubaE3tavGNw7d+jBu7cr4HW17Dezj2wL3MbAqQbirb8lSewfDws2Syhst84DOwF7WzuTlvrYa3sdNKn4IQgyj89b33JqG7LXkV5pAO8LuhI0HgIQgfu5kJF9QD63+cb7W4bD3Ut3kg/Vx2JH9Y3yr6E36A1N7K7ItfgnqheN9qMNhrq75pPw08Te/Wy/2iK59xntjiZ7qG7lPuxk3PrJo393L76rDzqug1PQfnWMq3SJqqX5jqOE+UPDtpJHLH52Dj/lOb/lqxcK4zBiATDIHtuNQRturAEbjlzrheR23OUdBv8a2sHiWgZJI3ytHYKSb2A2XU6rqRl6E1WNd9SXS7HeaVGdm+LjFYdJwpTNcFTyKsVa3lcG22ltBtUnXSYCsc86oCzsFUbliAPiax8QxawxPK/sorMbdFFzbz0rhHavtRLjZMzeCMaJGDoBvc9WNhr5CqylY5tTqY0V59jrXEO1nDg8efERsUYspXxhTlZb3W4BsxHXWtvg3ajDYqRo8O7OVF2ORlAF7DVgNT/I1wOHDlr2Gy5tdLi4F7nQDXfyrqnyO4ZVhne4JMgW46KoI3AO7N8DVVJtnLp9XUq1FGySOhVqY/hsM1u9jV8t7Zhf2gVO/Ig/w6Vt3rS4pxaHDpnmkVF8zqfIAak+QrQ9GVrfi4NTgHZuDBmUwBgJSpKk3Ayg2C31tqdya+9osIpTvNmUqLjmCygg9RrUJ2Y7bDGYx4UTLEIyylvaYhlBJ6Cx0Hl7ha8bhxIjISRmFrjl0PuOtV2a2K0Zwcbw4K1hMRkOoup0IrzKi6lW06EEH05g/GsOTLdfukr/dOX+VKx8jrFKUqACKiOI8PjXK4UZrlb72BFyovsLqDYdPIVL1ocYbRB+9f4K3+YrDU28KTfZmlP2kRfDsFbGRYhLZ4Y5ciG4TM2VMxy63ysw2PteWtmeczPebECLopiygcvC5kZCx+PkKg+HuBJqQPAdzbdl6+lSD4+P71/QE/mBaqaOrjp45Pv9WK0L1HYno+BQi2Yu5PNpGF+fsqQvuAqQjhVEyxqFABsqiw67DzqhzSRHKMj2VsygEBQbEXC5rA6nUC9bKcfnjB7v6Sw0SVr36ASWzC/Vs1bf3lBf7Ip4NTsa3ahXkgkgifJLKjBGN7aFc+2t8pPnueRqt4zCHiLd1isPiopFiscrIcOGN7Sgh/E41sLXAOo0q0J2ngxECTfNJCWKkqpQ5Teze3bxowNxYbHW9ba8Uw5+3Ivk0TD8xofdV1Wp8Jq/vIwly0Vfi7fMMMCwtAhiUEMS3gQRhzYA6qMrAbZARuQMXDu1a4uWJcKA5iQ5UQNZQbLdiRfU5Rbc8huayduFlxsXzXCC6uQZJHU7L4gEQXd3uL+FTtuDtavk57BR4CMG130YsRZmNiLuAbZRfwp9nc3Y6bxd0ZSW5UeL8XxcJfCiT6KNnBMZKs7Fi0jPa5OZyxspAsbFdL1CicBRZTbYWtbpyNt6lePH+lYj/jS/4jVGyQg+RPMc/XkffXJOV5bnTGNlseO7ZvaOUdB/M1kRFUaAAf63NYlLg5dGHI3I9QRr7tdedt6ydzf2jmP5D0H89/OqssjIkUj+whsQzZjoCEuWKj7VgLny1rwsQ3Op6n+XIe6ukcMwalIJQoGYwy2A0zSD5viAByUhkYjreuf4mHI7p91mX+6SP5VepDFJlISye51H5Ov/Yx/wBeX/FerNVZ+Tg/0CP+vN/ivVmrrh7KOaXLKZ8rE0i4HwEgGRVe3NSrCx8ibVx9lRgDnCtz0NvU2Gh9Lg+XPvXbHCd7gp0CGQlCQo3uPECPMEXtztauDZEYA5gGtqADrYX6WDfEc9KpPk8X+oRfiJ90b2LK5kXRvooibbWSEHXbS4JtpvryrVwOOkV1EbtGM6mynS4OhYbMR5i2+lecLIGYjLqQ4Uj95SoU9RqAK98L4dNIQ0cTuAb3A0uNhc6b1Q5LynK8fkbfEeP4thlkxUxb7QDlVH7pVbXPXpt6aJDNGCzX1ABZtlQEAC+tvFYAdK2W4FIv1zRx21IZwWtzOWPM35Vr48xbIzO33rZVAA0VVN2PqbempNSJxnu5/Pn7m92MxrRY2Ap9p1jN+khCH3i9/dX6Br83cJDd/Fl9rvEt6hhb1PlvX6QFaQPR/pjeMl5lW4pFkmcdTmH9rU/8watWp3tNgTJFmT6yMhlI1OhGZbcwy3FvTY2NQHC274eEgOPs33HVTzHwt8CcZySnj1Z7MbuNz1Stk4GT7hrXZSDYixoSfKr3a3CvL3axymMjMxsSAwJUZSyEMoNjqpvpz2qw1EcSB7wm2mVQPPVjceXit7q5tZUcKLaNKUcppMguzvDmzyEYfu2sgJLZwcoJv3puzXz8xfTUDSrJHws/ae3kB/Mn+VZOEjwE9WP5WX/trcrOlpqc4qc1dtLv2LSqSi8UzSXhi82Y/D+QrLHwxDoFYn+sx/nWxUhweEl83IX/APFdMaFJcRXoZupLuRsHZ4KLLBYXJttqxJJsTuSSa+ycIC6mBfXKD+dqmMbx6CNgpkUsTawOx31PLasw4pHe12vYm2RjoLC9gtwNa28ODM82V1cMg2RR/ZH+VfVhUEMqgMCCCALgjY7fxqYnhgbxiQAXtZbHXoANc3lvUdMAGygk89VKn3qwBpZom6ZUONcClzvKh70OzMw0DgsSxI2DC5OmnvqCVr+7QjYg9CDqD5V0hmAsCQL7efpWjxPg8U3tCz8nXRh7+Y8jcVnKCZdSaKG3tD0P8q91v4vgM6SADI62PjzBAL7ZwdRsdr3tU1w/swgs0zd6fu7J8Pte/TyqnhvqWzXQkOBzZ8LCCQVUMBbnd7nNrY2Ki3p8JPgvY7Dt9PKDIXJYIdEAJJHhHtXB+1ceVecHhS5EcYt1IFgg69Aeg5+lyLhGgUBQLAAADoBXVCN+TCTtwEQAAAAAaADQD3V6pStDMVyjt12LdcQJ8Ot45Sc6j7DEEk/1TqfXTmK6vUHxCQzSCNNhueXmfQVWfBnVoRrK0jleF4RDhIxPjPE59iEdfPqevIeelRuO41NiiVLZR9hFNl0vdT1uOZ5jleuucb7D4XEgFw6uBYOra231Bup36VS8d8l+IjObDyxygcnBQ+nMH4is8GedXoVY/gpr8Ply/eUBWKHaxF7gj3EEfkRWbFQKGbI2gJGVt9DyOzD8/Krnh/k1xkkal5I0bXwPqVsSAA65rqRrYG2tSfB/ksKyK886lVIORFve3Is+lv7NMWckdHWe2JH/ACS8C7yY4p1OSMWQkaFzoSOuUX95HSuu15jQKAFAAGwAsB6CvVapWPa09FUYYoVX+MdmxIxkhOR9yPsk9dNVPmPhc3qwUqlSlCpHGaujojNxd0UluJ4rD6TLder7e6RdL+tzW7F2khb62Mr7g4/LX8qtBFRmK7PYd/1YU9U8P5DQ+8Vy+BXh/jnddpb/AD5NfEhL2l6GLD4/DN7Lxg9NFPwNjVV7QS5p38rDly9P9em1Tc/Y8fYmI/rKG/6StY07HHnOPdHb/vNc2qp6mtDDBc3vc2pTpQeV/kROAxMaxqDIgJubFgDqS1rX3FZZeIRr9sH+r4v+m9vfUt+h6/jH+6P86yR9kIuckh/ugf8ATf8AOtorUJJKC9f4KOVO97v0Ky/FWPsR2/rkA78sma+npuK9QNiMQAihmHNUJCg87sTb3Ej0NXLD9nsMv6oMf3yW/Jjb8qk0QAWAsByFWWmrT/yTsu0fuVdWC9lepAcC7NLEQ8lmcbAeyvmOp89PTnVhpSuunSjTjjFWRjKbk7s12wMZkEhUZxs3PYr/AAJr7i8HHKMsiK410YA7ix38qz0rQqa0eAiUFRGljuMo8Xr199a7cEgP2SPR3A+Aa1SNKA18Lgo475EAJtc7k22ux1Nrn414bhkJ1MMeu/hGvrpW3SgPEUSqLKoUDkBYfAV7pSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoD/2Q=='
                    doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 25, 25);
                    doc.addImage(base64Img, 'JPEG', (doc.internal.pageSize.getWidth()-40), 15, 25, 25);
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

                margin: {top: 40}
            })

            if (typeof doc.putTotalPages === 'function') {
                doc.putTotalPages(totalPagesExp);
            }

            let nameSave = `Reporte_al_${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}.pdf`
            this.exportPDF = false
            this.disableButtonPDF = false
            this.textExport = ''
            doc.save(nameSave);

        },
        exportToExcel: function(exportFormat){
            let fecha = new Date()
            let wswt = XLSX.utils.json_to_sheet(exportFormat)
            let wb = XLSX.utils.book_new()
            this.textExport = ''
            this.disableButtonXLS = false
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
            if(xlsOrPdf === 'xls'){
                this.exportExcel = true
                this.disableButtonXLS = true
                this.xlsOrPdf = 'xls'
            }else {
                this.exportPDF = true
                this.disableButtonPDF = true
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
