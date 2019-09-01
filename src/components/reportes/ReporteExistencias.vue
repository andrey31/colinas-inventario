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
          </b-form-checkbox-group>
        </b-form-group>
      </b-col>

      <!-- <b-col cols="12" md="5" class="p-3 border border-muted"> -->
      <!--   <b-form-group> -->
      <!--     <label slot="label" class="pb-0 mb-0"><b>Fecha límite</b></label> -->
      <!--     <\!-- <b-input-group-text slot="prepend" >Fecha Límite</b-input-group-text> -\-> -->
      <!--     <b-form-input type="date"></b-form-input> -->
      <!--   </b-form-group> -->
      <!-- </b-col> -->
      <b-col cols="12" class="pt-4">
        <h4><b>Exportar</b></h4>
      </b-col>
      <b-col class="pt-2" cols="12">

        <b-button variant="success" size="lg" class="mr-2 p-2" @click="exportReport" :disabled="ubicationSelected.length === 0">
          <b-spinner label="Spinning" v-if="exportExcel"></b-spinner>
          {{textExportExcel}}
          <v-icon class="ml-2" name="file-excel" scale="2"></v-icon>
        </b-button>
        <b-button variant="danger" size="lg" :disabled="ubicationSelected.length === 0">
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
            textExportExcel: 'EXCEL',
            exportExcel: false,
            allSelect: false
        }
    },
    methods: {
        changeSelectAll: function(select){
            if (select) {
                this.ubications.forEach( u => {
                    this.ubicationSelected.push(u.value)
                })
            }else {
                this.ubicationSelected = []
            }
            console.log(select)
        },
        groupByTypePaper: function (totalRolls) {
            let filter = {}
            let wt = []
            let linerR = []
            let liner = []
            let medium = []

            totalRolls.rollsByGramaje.forEach( el => {
                let typePaper = (el.tipo).split('-')
                if(typePaper[1] === 'WHITE TOP'){
                    el['Gramaje-Ancho'] = typePaper[0]
                    el['Tipo papel'] = 'WHITE TOP'
                    el['Ubicacion'] = typePaper[2]
                    wt.push(el)
                }else if(typePaper[1] === 'LINER R'){
                    el['Gramaje-Ancho'] = typePaper[0]
                    el['Tipo papel'] = 'LINER R'
                    el['Ubicacion'] = typePaper[2]
                    linerR.push(el)
                }else if(typePaper[1] === 'LINER'){
                    el['Gramaje-Ancho'] = typePaper[0]
                    el['Tipo papel'] = 'LINER'
                    el['Ubicacion'] = typePaper[2]
                    liner.push(el)
                }else if(typePaper[1] === 'MEDIUM'){
                    el['Gramaje-Ancho'] = typePaper[0]
                    el['Tipo papel'] = 'MEDIUM'
                    el['Ubicacion'] = typePaper[2]
                    medium.push(el)
                }
                delete el.tipo
            })

            filter['wt'] = wt
            filter['liner'] = liner
            filter['linerR'] = linerR
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
                el['Peso total (Kgs)'] = Math.round(peso).toLocaleString('en-us')
                el['Metros total'] = Math.round(meters).toLocaleString('en-us')
                delete el.roll
                gramajesAlt.push(el)
            })

            total.rollsByGramaje = gramajesAlt

            return total
        },
        sendXLS: function (allRolls) {
            let totalRolls = this.totalRolls(allRolls)
            this.textExportExcel = 'Aplicando formato excel...'
            let groupByTypePaper = this.groupByTypePaper(totalRolls)
            let cpWt = (groupByTypePaper.wt).slice()
            let cpMedium = (groupByTypePaper.medium).slice()
            let cpLiner = (groupByTypePaper.liner).slice()
            let cpLinerR = (groupByTypePaper.linerR).slice()
            let exportFormat = []
            // exportFormat.unshift({'Fecha de ': '222-2-2'})
            let fecha = new Date()
            exportFormat.unshift({
                'Fecha de reporte': fecha,
                'Tipo papel': '',
                'Gramaje-Ancho': '',
                'Cantidad de rollos': '',
                'Peso total (Kgs)': '',
                'Metros total': '',
                'Ubicacion': ''
            })
            if (cpWt.length > 0) {

                let cpWt1 = this.filterBodega(cpWt, 1)
                let cpWt2 = this.filterBodega(cpWt, 2)
                let cpWt3 = this.filterBodega(cpWt, 3)
                let cpWt4 = this.filterBodega(cpWt, 4)
                let cpWt5 = this.filterBodega(cpWt, 5)

                cpWt1.forEach( el => {
                    exportFormat.push(el)
                })
                cpWt2.forEach( el => {
                    exportFormat.push(el)
                })

                cpWt3.forEach( el => {
                    exportFormat.push(el)
                })
                cpWt4.forEach( el => {
                    exportFormat.push(el)
                })
                cpWt5.forEach( el => {
                    exportFormat.push(el)
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
            if (cpMedium.length > 0) {
                let cpMedium1 = this.filterBodega(cpMedium, 1)
                let cpMedium2 = this.filterBodega(cpMedium, 2)
                let cpMedium3 = this.filterBodega(cpMedium, 3)
                let cpMedium4 = this.filterBodega(cpMedium, 4)
                let cpMedium5 = this.filterBodega(cpMedium, 5)
                cpMedium1.forEach( el => {
                    exportFormat.push(el)
                })
                cpMedium2.forEach( el => {
                    exportFormat.push(el)
                })
                cpMedium3.forEach( el => {
                    exportFormat.push(el)
                })
                cpMedium4.forEach( el => {
                    exportFormat.push(el)
                })
                cpMedium5.forEach( el => {
                    exportFormat.push(el)
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
            if (cpLiner.length > 0) {
                let cpLiner1 = this.filterBodega(cpLiner, 1)
                let cpLiner2 = this.filterBodega(cpLiner, 2)
                let cpLiner3 = this.filterBodega(cpLiner, 3)
                let cpLiner4 = this.filterBodega(cpLiner, 4)
                let cpLiner5 = this.filterBodega(cpLiner, 5)

                cpLiner1.forEach( el => {
                    exportFormat.push(el)
                })
                cpLiner2.forEach( el => {
                    exportFormat.push(el)
                })

                cpLiner3.forEach( el => {
                    exportFormat.push(el)
                })
                cpLiner4.forEach( el => {
                    exportFormat.push(el)
                })
                cpLiner5.forEach( el => {
                    exportFormat.push(el)
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

            if (cpLinerR.length > 0){
                let cpLinerR1 = this.filterBodega(cpLinerR, 1)
                let cpLinerR2 = this.filterBodega(cpLinerR, 2)
                let cpLinerR3 = this.filterBodega(cpLinerR, 3)
                let cpLinerR4 = this.filterBodega(cpLinerR, 4)
                let cpLinerR5 = this.filterBodega(cpLinerR, 5)

                cpLinerR1.forEach( el => {
                    exportFormat.push(el)
                })
                cpLinerR2.forEach( el => {
                    exportFormat.push(el)
                })
                cpLinerR3.forEach( el => {
                    exportFormat.push(el)
                })
                cpLinerR4.forEach( el => {
                    exportFormat.push(el)
                })
                cpLinerR5.forEach( el => {
                    exportFormat.push(el)
                })
            }
            let wswt = XLSX.utils.json_to_sheet(exportFormat)

            let wb = XLSX.utils.book_new()
            this.textExportExcel = 'EXCEL'
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
        exportReport: function(){
            this.exportExcel = true
            let allRolls = []
            let ubicacionesTotal = this.ubicationSelected.length
            this.ubicationSelected.forEach ( u => {
                if (u === 'enTransito') ubicacionesTotal++
            })
            this.ubicationSelected.forEach( u => {

                if (u === 'enTransito'){
                    this.textExportExcel = 'Cargando rollos en transito...'
                    this.db.ref('/sislocarEnTransito').once('value').then( sisEnTransito => {
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
                    this.textExportExcel = 'Cargando rollos telisa...'
                    this.db.ref('/telisa').once('value').then ( data => {
                        let telisa = data.val()

                        for (let i in telisa) {
                            telisa[i].ubicacion = 'Telisa'
                            allRolls.push(telisa[i])
                        }
                        ubicacionesTotal --
                        if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                    })
                }
                if (u === 'sislocar') {
                    this.textExportExcel = 'Cargando rollos sislocar...'
                    this.db.ref('/sislocar').once('value').then ( data => {
                        let sislocar = data.val()

                        for (let i in sislocar) {
                            sislocar[i].ubicacion = 'Sislocar'
                            allRolls.push(sislocar[i])
                        }
                        ubicacionesTotal --
                        if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                    })
                }
                if (u === 'bodega1' || u === 'planta') {
                    this.textExportExcel = 'Cargando rollos en inventario ...'
                    let inventario = []
                    this.db.ref('/Inventario').once('value').then ( data => {
                        inventario = data.val()
                        console.log(inventario)
                        if ( u === 'bodega1'){
                            for (let i in inventario) {
                                inventario[i].ubicacion = 'Bodega 1'
                                allRolls.push(inventario[i])
                            }
                            ubicacionesTotal --
                            if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                        }
                        if ( u === 'planta'){
                            for (let i in inventario) {
                                inventario[i].ubicacion = 'Planta'
                                allRolls.push(inventario[i])
                            }
                            ubicacionesTotal --
                            if (ubicacionesTotal === 0) this.sendXLS(allRolls)
                        }



                    })


                }

            })
            // this.db.ref('/Inventario').once('value').then( snap => {
            //     let snapVal = snap.val()
            //     for (let key in snapVal) {
            //         allRolls.push({
            //             'id': snapVal[key].idNumber
            //         })
            //     }
            //     console.log(allRolls)
            // })
            // this.ubicationSelected.forEach( u => {
            //     console.log()
            // })
        }
    }
}
</script>
