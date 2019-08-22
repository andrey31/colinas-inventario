<template>

<b-container fluid>
  <h2>PACKING LIST</h2>
  <b-row class="text-center">
    <b-col cols="12">
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="my-table"
        align="center"
        >
      </b-pagination>
    </b-col>
    <b-col cols="4">
      <b-input-group>
        <b-input-group-text slot="prepend">Busqueda</b-input-group-text>
        <b-form-input v-model="search"></b-form-input>
      </b-input-group>
    </b-col>
  </b-row>
  <b-tabs class="bg-ligth" pills card>
    <b-tab title="Lista de paquetes">
      <b-table
        :items="order"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        :filter="search"
        head-variant="dark"
        responsive
        >
        <template slot="download" slot-scope="row">
          <a class="btn btn-primary" :href="row.item.download"><v-icon name="download"></v-icon></a>
        </template>

        <template slot="rolls" slot-scope="row">
          <b-button @click.stop="showRolls(row)"><v-icon name="expand-arrows-alt"></v-icon></b-button>
        </template>

        <template slot="delete" slot-scope="row">
          <b-button @click="deleteOrder(row.item.key, row.item.packingList, row.item.ourOrder, row.item.almacen)"
                    variant="danger" v-if="!disableButtonDelete"><v-icon name="trash-alt"></v-icon></b-button>

          <b-button variant="danger" disabled v-else><v-icon name="trash-alt"></v-icon></b-button>
        </template>

        <template slot="row-details" slot-scope="row">
          <hr/><hr/>
          <b-row class="my-4">
            <b-col cols="4" offset="4">
              <b-button variant="primary"
                        :disabled="(countSelectRolls < row.item.packingList.length)"
                        @click="showModalSendRolls = true">
                Registrar rollos
              </b-button>
              <!-- <b-button variant="primary" :disabled="rollsCheck.length <= 0" @click="sendRollsToAlmacen"> -->
              <!--   Rollos en almacen -->
              <!-- </b-button> -->
            </b-col>
            <!-- <b-col cols="3"> -->
            <!--   <\!-- <b-form-checkbox v-model="rollsCheck" :value="row.item">Seleccionar todos</b-form-checkbox> -\-> -->
            <!--   <b-form-checkbox v-model="rollsCheckAll" @change="selectAll(row.item.packingList)"> -->
            <!--     Seleccionar todos -->
            <!--   </b-form-checkbox> -->
            <!-- </b-col> -->
          </b-row>
          <b-table
            :items="row.item.packingList"
            :fields="fieldsRolls"
            head-variant="dark"
            striped
            >
            <template slot="kgs" slot-scope="row">
              {{Number(row.item.kgs).toFixed(2)}}
            </template>
            <template slot="enTransito" slot-scope="row">
              <label v-if="row.item.enTransito">Sí</label>
              <label v-else>No</label>
            </template>
            <template slot="enAlmacen" slot-scope="row">
              <b-form-checkbox v-if="row.item.enTransito" v-model="rollsCheck" :value="row.item"
                               :disabled="rollsNotCheck.includes(row.item)" v-b-tooltip.hover :title="row.item.idNumber">
              </b-form-checkbox>
              <label for="" v-if="!row.item.enTransito && !row.item.comentarioNoLlego">Ya registrado</label>
              <label for="" v-if="!row.item.enTransito && row.item.comentarioNoLlego">--</label>
            </template>
            <template slot="noLlego" slot-scope="row">
              <b-form-checkbox v-if="row.item.enTransito" v-model="rollsNotCheck" :value="row.item"
                               :disabled="rollsCheck.includes(row.item)" v-b-tooltip.hover :title="row.item.idNumber">
              </b-form-checkbox>
              <label for="" v-if="!row.item.enTransito && row.item.comentarioNoLlego">{{row.item.comentarioNoLlego}}</label>
              <label for="" v-if="!row.item.enTransito && !row.item.comentarioNoLlego">--</label>
            </template>
            <template slot="DUA" slot-scope="row" >
              <b-button v-if="!row.item.dua" @click="showModalDUASet(row.item)"
                        v-b-tooltip.hover :title="row.item.idNumber">
                Agregar
              </b-button>
              <label v-else @click="showModalDUASet(row.item)">{{row.item.dua}}</label>
              <!-- <h5 v-else><b-badge  pill>{{row.item.dua}}</b-badge></h5> -->
              <!-- <b-button v-else @click="showModalDUASet(row.item)">{{row.item.dua}}</b-button> -->


            </template>
          </b-table>
          <hr/><hr/>
        </template>
      </b-table>
    </b-tab>
    <b-tab title="Rollos en tránsito" @click="loadRollosEnTransito">
      <b-table :items="rollosEnTransito">
      </b-table>
    </b-tab>
  </b-tabs>
  <b-modal v-model="showModalDUA.show" header-bg-variant="primary">
    <template slot="modal-title">
      DUA para el rollo: <b>{{showModalDUA.roll.idNumber}}</b>
    </template>
    <b-form-input  placeholder="Ingrese DUA" v-model="showModalDUA.dua"></b-form-input>
    <div slot="modal-footer" class="">
      <b-button variant="danger" class="mr-2" @click="showModalDUA.show = false">Cancelar</b-button>
      <b-button variant="primary" @click="sendDUA()">Agregar</b-button>
    </div>
  </b-modal>
  <b-modal title="Rollos marcados" v-model="containsSelectedRolls" header-bg-variant="warning" hide-footer>
    <h4>Tiene rollos seleccionados por favor desmarcar o enviar antes de continuar con otro packinglist</h4>
  </b-modal>
  <b-modal v-model="showModalSendRolls"
           header-bg-variant="primary"
           no-close-on-backdrop
           size="lg"
           >
    <template slot="modal-title">
      Registrar
    </template>
    <div class="text-center">
      Se registrarán los siguientes rollos en el almacen:
      <ul>
        <li v-for="roll in rollsCheck">{{roll.idNumber}}</li>
      </ul>
    </div>
    <div class="text-center">
      Por favor, ingrese un comentario de porque el rollo no llegó:
      <ul>


        <li v-for="roll in rollsNotCheck">
          <b-row class="pt-2">
          <b-col cols="2" class="pt-1" offset="1">{{roll.idNumber}}</b-col>
          <b-col cols="8">
            <b-form-input v-model="roll.comentarioNoLlego" placeholder="Ingrese comentario"></b-form-input>
          </b-col>
          </b-row>
        </li>

      </ul>
    </div>
    <div slot="modal-footer" class="">
      <b-button variant="danger" class="mr-2" @click="showModalSendRolls = false">Cancelar</b-button>
      <b-button variant="primary" @click="sendRollsToAlmacen">Enviar</b-button>
    </div>
  </b-modal>
</b-container>
</template>

<script>
import firebase from 'firebase/app'
export default{
  name: 'PackingList',
  mounted(){
    this.db.ref('/order')
      .on('value', snapshot => this.loadData(snapshot.val()))
  },
  computed: {
    countSelectRolls(){
      return this.rollsCheck.length + this.rollsNotCheck.length
    },
    disableButtonDelete(){
      let email1 = this.currentUser.email === 'omar.duran@corrugadosaltavista.com'
      let email2 = this.currentUser.email === 'admin@corrougosaltavista.com'
      if ( email1 || email2 ) {
         return false
      }
      else return true
    },
    rows() {
      return this.order.length
    }
  },
  data(){
    return{
      db: firebase.database(),
      currentUser: firebase.auth().currentUser,
      order: [],
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
      fields: ['provided', 'date', 'shipped', 'shipment', 'carrier', 'vehicle',
               'booking', 'comment', 'ourOrder', 'yourOrder', 'almacen', 'download', 'rolls', 'delete'],
      fieldsRolls: [
        {key: 'idNumber', label: 'Numero de rollo'},
        {key: 'meters', label: 'Metros lineales'},
        'gramaje',
        {key: 'width', label: 'Ancho'},
        {key: 'typePaper', label: 'Tipo de papel'},
        {key: 'kgs', label: 'Kilogramos'},
        'enTransito',
        'enAlmacen',
        {key: 'noLlego', label: 'No llegó'},
        {key: 'comments', label: 'Comentario'},
        'DUA'
      ],
      perPage: 20,
      currentPage: 1,
      rollosEnTransito: [],
      rollsCheck: [],
      rollsNotCheck: [],
      search: '',
      rollsCheckAll: false,
      showModalSendRolls: false,
      containsSelectedRolls: false,
      showModalDUA: {
        show: false,
        roll: '',
        dua: ''
      }
    }
  },
  methods: {
    deleteOrder: function(key, rolls, ourOrder, almacen){
      this.db.ref('/order').child(key).remove()
      rolls.forEach( rol => {
        this.db.ref(almacen+'EnTransito').child(rol.key).remove()
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
        this.db.ref(almacen+'EnTransito').child(element).once('value')
          .then(snapshot => {
            let p = snapshot.val()
            if(p) {
              let rowv = p.enTransito === true ? 'primary' : 'danger'
              arr.push({
                'key': element,
                'idNumber': p.idNumber,
                'fecha': p.fecha,
                'meters': p.meters,
                'gramaje': p.gramaje,
                'typePaper': p.typePaper,
                'kgs': p.kgs,
                'weight': p.weight,
                'width': `${p.width}\"`,
                'comments': p.comments,
                'enTransito': p.enTransito,
                'almacen': almacen,
                '_rowVariant': rowv,
                'comentarioNoLlego': p.comentarioNoLlego,
                'dua': p.dua
              })
            }

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
    loadRollosEnTransito: function(){
      this.rollosEnTransito = []
      this.db.ref('sislocarEnTransito').once('value').then(snap => {
        let roll = snap.val()
        for (let key in roll){
          this.rollosEnTransito.push({
          'idNumber': roll[key].idNumber,
          'kgs': roll[key].kgs,
          'meters': roll[key].meters,
          'gramaje': roll[key].gramaje,
          'width': roll[key].width,
          'typePaper': roll[key].typePaper,
          'comments': roll[key].comments
          })
        }
      })

      this.db.ref('telisaEnTransito').once('value').then( snap => {
        let roll = snap.val()
        for (let key in roll){
          this.rollosEnTransito.push({
          'idNumber': roll[key].idNumber,
          'kgs': roll[key].kgs,
          'meters': roll[key].meters,
          'gramaje': roll[key].gramaje,
          'width': roll[key].width,
          'typePaper': roll[key].typePaper,
          'comments': roll[key].comments
          })
        }
      })

    },
    // selectAll: function(packingList){
    //   this.rollsCheck = []
    //   if(!this.rollsCheckAll){
    //     packingList.forEach( roll => {
    //       roll.enTransito ? this.rollsCheck.push(roll) : null
    //     })
    //   }
    // },
    showRolls: function(row){

      if (this.rollsCheck.length > 0) {
        this.containsSelectedRolls = true
        console.log('Tiene seleccionados')
      }else{
        row.toggleDetails()
      }
      // this.rollsCheck = []

    },
    sendRollsToAlmacen: function(){
      this.rollsNotCheck.forEach( roll => {
        this.db.ref((roll.almacen)+'EnTransito').child(roll.idNumber).update(
          {
            comentarioNoLlego: roll.comentarioNoLlego,
            enTransito: false
          }
        ).then( (data) => {
          roll.enTransito = false
          roll._rowVariant = 'danger'
        })
      })

      this.rollsCheck.forEach( (roll, index, arr) => {

        let r = {
          comments: roll.comments,
          fecha: roll.fecha,
          gramaje: roll.gramaje,
          idNumber: roll.idNumber,
          kgs: roll.kgs,
          meters: roll.meters,
          typePaper: roll.typePaper,
          width: roll.width
        }
        this.db.ref(roll.almacen).child(r.idNumber).set(r).then((data) => {
          let rollId = r.idNumber
          this.db.ref((roll.almacen)+'EnTransito').child(rollId).update(
            {
              enTransito: false
            }
          ).then( (data) => {
            roll.enTransito = false
            roll._rowVariant = 'danger'

            console.log('en transito actualizado')
            if (index === arr.length - 1 ) this.showModalSendRolls = false
          }).catch( error => {
            console.log('error transito no actualizado ' +error)
          })
          console.log('agregdo '+r.idNumber)
        }).catch( error => {
          console.log('error')
        })
      })
      this.rollsCheck = []
      this.rollsNotCheck = []
    },
    showModalDUASet: function(roll){
      this.showModalDUA = {
        show: true,
        roll,
        dua: ''
      }
    },
    sendDUA: function(){
      let almacen = (this.showModalDUA.roll.almacen)+'EnTransito'
      let idNumber = this.showModalDUA.roll.idNumber
      this.db.ref(almacen).child(idNumber).update(
        {
          dua: this.showModalDUA.dua
        }
      ).then((data) => {
        console.log('agregado'),
        this.showModalDUA.roll.dua = this.showModalDUA.dua
        this.showModalDUA.show = false
      })
    },
  }

}
</script>
