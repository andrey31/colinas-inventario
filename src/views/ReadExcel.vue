<template>
<b-container>
  <b-row>
    <b-col>
      <b-alert dismissible v-model="showAlert">Se agregó packinglist</b-alert>
    </b-col>
    <b-col cols="12" class="mb-4">
      <b-form-file
        v-model="file"
        :state="Boolean(file)"
        placeholder="Escoja el archivo .xls..."
        drop-placeholder="Arrastre el archivo aquí..."
        @change="clear"
        class="mb-2"
        />
      <b-button @click="load"><v-icon name="tasks" class="secondary"></v-icon> Verificar</b-button>
      <b-button @click="showModalUpload" variant="primary" class="mx-2" :disabled="disabledUpload">
        <v-icon name="cloud-upload-alt" scale="1.5"></v-icon> Subir a base de datos</b-button>
    </b-col>

    <b-modal v-model="showModal">
      <h3>Escoja el almacen fiscal</h3>
      <b-container class="p-4">
        <b-row>
          <b-col><b-form-radio v-model="almacen" name="some-radios" value="telisa">Telisa</b-form-radio></b-col>
          <b-col><b-form-radio v-model="almacen" name="some-radios" value="sislocar">Sislocar</b-form-radio></b-col>
          <b-col><b-form-radio v-model="almacen" name="some-radios" value="otro">Otro</b-form-radio></b-col>
        </b-row>
      </b-container>

      <p>Se subiran {{rollsNotExistsInDb.length}} rollos de {{arrayData.length}}</p>

      <template slot="modal-footer">
        <b-container fluid>
          <b-row>
            <b-col>
              <b-btn @click="showModal = false" variant="danger" block class="mr-2">Cancel</b-btn>
              <b-btn variant="primary" block @click="uploadFile()" :disabled="almacen === ''">Aceptar</b-btn>
            </b-col>
          </b-row>
        </b-container>
      </template>

    </b-modal>

    <b-col cols="6" offset="3" v-if="spinner">
      <strong class="mr-2">{{textSpinner}}</strong>
      <b-spinner variant="primary" label="Loading..." />
    </b-col>

    <b-col cols="12">
      <b-alert variant="danger" v-model="showAlertError">{{textAlertError}}
      </b-alert>
    </b-col>

    <template v-if="provided !== ''">
      <b-col cols="4" class="bg-light">
        <p><b>Provided: </b> {{provided}}</p>
        <p><b>Date: </b>{{date}}</p>
        <p><b>Shipped: </b>{{shipped}}</p>
        <p><b>Shipment: </b>{{shipment}}</p>
      </b-col>

      <b-col cols="4" class="bg-light">
        <p><b>Carrier: </b>{{carrier}}</p>
        <p><b>Vehicle: </b>{{vehicle}}</p>
        <p><b>Booking: </b>{{booking}}</p>
      </b-col>
      <b-col cols="4" class="bg-light">
        <p><b>Our order: </b>{{ourOrder}}</p>
        <p><b>Your order: </b>{{yourOrder}}</p>
        <p><b>Comment: </b>{{comment}}</p>
      </b-col>
    </template>

    <b-col>
      <b-table
        :items="arrayData"
        >
      </b-table>
    </b-col>
  </b-row>
</b-container>

</template>

<script>
import firebase from 'firebase/app'
export default{
  name: 'ReadExcel',
  computed: {
  },
  data(){
    return{
      file: null,
      arrayxls: null,
      arrayData: [],
      rollsExistsInDb: [],
      rollsNotExistsInDb: [],
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
      db: firebase.database(),
      spinner: false,
      textSpinner: 'Subiendo excel...',
      disabledUpload: true,
      showAlert: false,
      showAlertError: false,
      textAlertError: '',
      showModal: false,
      almacen: '',
      currentUser: firebase.auth().currentUser,
    }
  },
  methods: {
    clear: function(){
      this.arrayxls = null,
      this.arrayData = [],
      this.provided = '',
      this.date = '',
      this.shipped = '',
      this.shipment = '',
      this.carrier = '',
      this.vehicle = '',
      this.booking = '',
      this.comment = '',
      this.ourOrder = '',
      this.yourOrder = '',

      this.showAlert = false,
      this.showAlertError = false,
      this.textAlertError = '',

      this.disabledUpload = true,
      this.rollsExistsInDb = [],
      this.rollsNotExistsInDb = []
    },
    uploadFile: function(){
      this.showModal = false
      this.spinner = true
      this.disabledUpload = true
      let storageRef = firebase.storage().ref();

      let file = this.file

      let metadata = {
        contentType: 'application/vnd.ms-excel'
      }

      let keyOrder = this.db.ref('order').push().key;
      let uploadTask = storageRef.child('packing-list/'+keyOrder+'.xlsx').put(file, metadata)

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                    snapshot => {
                      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      this.textSpinner = 'Subiendo '+progress + '%'
                      console.log('Upload is ' + progress + '% done');
                      switch (snapshot.state) {
                      case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                      case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                      }
                    }, error => {

                      // A full list of error codes is available at
                      // https://firebase.google.com/docs/storage/web/handle-errors
                      switch (error.code) {
                      case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        this.textSpinner = 'Error, no authorizado'
                        break;

                      case 'storage/canceled':
                        this.textSpinner = 'Error, subida cancelada'
                        // User canceled the upload
                        break;

                      case 'storage/unknown':
                        this.textSpinner = 'Error, intentelo nuevamente'
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                      }
                    }, () =>{
                      // Upload completed successfully, now we can get the download URL
                      uploadTask.snapshot.ref.getDownloadURL().then( (downloadURL) => {
                        console.log('File available at', downloadURL);
                        // this.upload()
                        this.upload(downloadURL, keyOrder)
                      });
                    });

    },
    changeApply: function(change, ubication, arrayKeys){
      let d = new Date()
      let month = '' + (d.getMonth() + 1)
      let day = '' + d.getDate()
      let year = d.getFullYear()

      let hour = d.getHours()
      let minutes = d.getMinutes()
      let seconds = d.getSeconds()
      let tz = hour < 12 ? ' am.' : ' pm.'

      let idsRegistrados = []

      for (let i in arrayKeys) {

        let changeObj = {

          cambioRealizado: change,
          fecha: day + '-' + month + '-' + year,
          hora: hour + ':' + minutes + ':' + seconds + tz,
          nota: '',
          numRollo: arrayKeys[i],
          ubicacion: ubication,
          usuario: this.currentUser.email

        }

        let key = this.db.ref('CambiosRealizados').push().key

        this.db.ref('CambiosRealizados').child(key).set(changeObj).then(data => {
          idsRegistrados.push('')
          this.textSpinner = 'Registrando cambio al rollo '+changeObj.numRollo+' ...'

          if( idsRegistrados.length === arrayKeys.length){
            this.disabledUpload = true
            this.showAlert = true
            this.spinner = false
          }


        }).catch( error => {
          console.log(error + ' al cambiar')
        })
      }

    },
    upload: function(downloadURL, keyOrder){
      // Subir datos a firebase
      this.textSpinner = 'Subiendo datos ...'
      let arrayKeys = []
      let saveIdRegisterChanges = []
      this.rollsNotExistsInDb.forEach( packing => {
        // console.log(packing.idNumber)
        // let key = this.db.ref('packing-list').push().key;
        let almacenCustom = this.almacen + 'EnTransito'
        this.db.ref(almacenCustom).child(packing.idNumber).set(packing)
          .then((data) => {

            console.log('Agregado packing-list')
            this.textSpinner = 'Packing list cargado, espere por favor...'
            saveIdRegisterChanges.push(packing.idNumber)
            arrayKeys.push(packing.idNumber)
            if(arrayKeys.length === this.rollsNotExistsInDb.length){
              this.uploadOrder(arrayKeys, downloadURL, keyOrder, arrayKeys)
            }
          })
          .catch(error => {
            this.textSpinner = 'Ocurrió un error al subir los datos'
          })

      })

      // this.uploadFile()
    },
    uploadOrder: function(uids, downloadURL, keyOrder, arrayKeys){
      this.db.ref('order').child(keyOrder).set({
        'provided': this.provided,
        'date': this.date,
        'shipped': this.shipped,
        'shipment': this.shipment,
        'carrier': this.carrier,
        'vehicle': this.vehicle,
        'booking': this.booking,
        'comment': this.comment,
        'ourOrder': this.ourOrder,
        'yourOrder': this.yourOrder,
        'packing-list': uids,
        'downloadXLS': downloadURL,
        'almacen': this.almacen
      }).then( () => {
        this.textSpinner = 'Subiendo datos de orden ...'
        this.changeApply('Rollo registrado desde packing list', 'En transito', arrayKeys)

      })
    },
    load: function(){
      if(this.file != null){
        this.transformXLS()
        this.showAlert = false
      }

    },
    getListRolls: function(){

      this.arrayData = []
      console.log(this.arrayxls.length)
      let idNumbers = []
      // menos 3 los campos no necesarios datos como total y el uno del arreglo
      let d = new Date()
      let month = '' + (d.getMonth() + 1)
      let day = '' + d.getDate()
      let year = d.getFullYear()

      for(let i = 8; i<= (this.arrayxls.length - 3); ++i){
        let a = Object.values(this.arrayxls[i])

        idNumbers.push(a[0])

        this.arrayData.push(
          {
            'idNumber': a[0],
            'weight': a[1].toFixed(2),
            'kgs': Number((a[2] * 1000).toFixed(2)),
            'fecha': day + '-' + month + '-' + year,
            'meters': Number((a[3] / 3.2808).toFixed(2)),
            'width': a[4],
            'gramaje': a[5].split('#')[0],
            'typePaper': a[5].split('#')[1],
            'comments': a[6] === null ? a[6] : ''
          }
        )
      }
      this.existsPackingList(idNumbers)

    },
    hasDuplicates: function(idNumbers){

      return (new Set(idNumbers)).size !== idNumbers.length;

    },
    existsPackingList: function(idNumbers){
      this.rollsNotExistsInDb = []
      if(this.hasDuplicates(idNumbers)){
        this.disabledUpload = true
        this.showAlertError = true
        this.textAlertError = 'Este packing list cuenta con un id del rollo duplicado'
        console.log('esta duplicado')
      }else{
        let exist = false
        this.textAlertError = 'Estos rollos ya se encuentran en la base de datos'

        let pivot = []
        let almacenes = ['sislocarEnTransito', 'telisaEnTransito', 'otroEnTransito']

        for (let almacen in almacenes){
          this.arrayData.forEach( data => {

            this.db.ref(almacenes[almacen]).child(data.idNumber).once('value')
              .then(snapshot => {
                if(snapshot.val()) {
                  data._rowVariant = 'danger'
                  this.rollsExistsInDb.push(data)
                }
                pivot.push(data)

                if(pivot.length/3 === this.arrayData.length){

                  if(this.rollsExistsInDb.length === this.arrayData.length){
                    this.showAlertError = true
                    this.disabledUpload = true
                    console.log('todos los rollos existen en db')
                  }else{
                    this.arrayData.forEach( roll => {
                      if(this.rollsExistsInDb.indexOf(roll) === -1){
                        roll.enTransito = true
                        roll.dua = ''

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

                        this.rollsNotExistsInDb.push({...roll})
                        roll._rowVariant = 'primary'
                      }
                    })
                    this.disabledUpload = false

                  }

                }

              })

          })


        }
      }


    },
    othersData: function(){
      this.provided = Object.keys(this.arrayxls[0])[1]
      this.date = this.transformDate(Object.values(this.arrayxls[0])[1])
      this.vehicle = Object.values(this.arrayxls[0])[3]
      this.ourOrder = Object.values(this.arrayxls[0])[5]
      this.shipped = this.transformDate(Object.values(this.arrayxls[1])[1])
      this.booking = Object.values(this.arrayxls[1])[3]
      this.yourOrder = Object.values(this.arrayxls[1])[5]
      this.shipment = Object.values(this.arrayxls[2])[1]
      this.comment = Object.values(this.arrayxls[2])[3]
      this.carrier = Object.values(this.arrayxls[3])[1]
      // this.existsPackingList()
    },
    transformDate: function(date){
      //Tranformar fecha excel la devuelve en entero
      let d = new Date(Math.round((date - 25569)*86400*1000));
      let f = new Date()
      let format = (d.getDate()) + '/' + (d.getMonth()+1) + '/' + (d.getFullYear())
      return format
    },
    transformXLS: function(){
      /* set up XMLHttpRequest */
      var url = URL.createObjectURL(this.file)
      var oReq = new XMLHttpRequest();
      oReq.open("GET", url, true);
      oReq.responseType = "arraybuffer";
      oReq.onload = e => {
        var arraybuffer = oReq.response;

        /* convert data to binary string */
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");

        /* Call XLSX */
        var workbook = XLSX.read(bstr, {
          type: "binary"
        });

        /* DO SOMETHING WITH workbook HERE */
        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];

        this.arrayxls = XLSX.utils.sheet_to_json(worksheet, {
          raw: true
        })
        //LLama metodos cuando el excel ya ha
        this.getListRolls()
        this.othersData()
      }
      oReq.send();

    },
    showModalUpload: function(){
      this.almacen = ''
      this.showModal = true
    }
  }
}

</script>

<style>

.custom-file-input:lang(en) ~ .custom-file-label::after {
  content: 'Buscar';
}
.custom-file-input:lang(es) ~ .custom-file-label::after {
  content: 'Buscar';
}
</style>
