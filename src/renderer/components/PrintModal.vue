<template>
    <b-modal
      ref="modal"
      id="print-modal"
      title="Print Label"
      @ok="handlePrint"
      >
      <div v-if="loading" class="text-center">
        <b-spinner label="Loading..."></b-spinner>
      </div>
      <form v-else ref="form" @submit.stop.prevent="hideModal">
        <b-row>
          <b-col cols="3">
            <img v-if="imgSrc" id="labelImg" :src="imgSrc" alt="Label Preview" />
          </b-col>
          <b-col>
            <b-form-group
              id="printer-group"
              label="Printer:"
              label-for="printer-input">
              <b-form-select
                v-model="form.printer"
                :options="printerOptions"
                ></b-form-select>
            </b-form-group>
            <b-form-group
              id="quantity-group"
              label="Quantity:"
              label-for="quantity-input">
              <b-form-input
                v-model="form.quantity"
                type="number"
                min="1"
                ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
      </form>
      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button variant="danger" @click="hideModal">
          Cancel
        </b-button>
        <b-button variant="success" @click="handlePrint" :disabled="!canPrint">
          Print
        </b-button>
      </template>
    </b-modal>
</template>

<script>
  import storage from 'electron-json-storage'
  import moment from 'moment'
  import fs from 'fs'

  export default {
    name: 'print-modal',
    props: {
      product: {
        type: Object,
        default: () => {}
      }
    },
    data () {
      return {
        form: {
          printer: 0,
          quantity: 1
        },
        label: null,
        imgSrc: null,
        printers: [],
        dymo: null,
        loading: true
      }
    },
    computed: {
      printerOptions () {
        let printers = this.printers.map((printer, index) => {
          return { value: index, text: printer.name }
        })
        printers.unshift({ value: null, text: 'Select a Printer' })
        return printers
      },
      selectedPrinter () {
        return this.printers[this.form.printer]
      },
      canPrint () {
        return Boolean(this.dymo && this.selectedPrinter && this.form.quantity && !this.loading && this.label)
      }
    },
    created () {
      window.onload = () => this.initDymo()
      this.$root.$on('bv::modal::hide', (event, modalId) => this.hideModal())
      this.$root.$on('bv::modal::show', (event, modalId) => {
        if (modalId === this.$refs.modal.id) {
          this.initDymo()
          this.setupLabel()
        }
      })
    },
    methods: {
      initDymo () {
        if (window && window.dymo) {
          if (!this.dymo) {
            this.dymo = window.dymo.label.framework
            this.dymo.trace = true
            this.dymo.init(() => this.handleSetup())
          } else {
            this.handleSetup()
          }
        }
      },
      handleSetup () {
        this.printers = this.dymo.getPrinters()
        this.importLabel()
        this.loading = false
      },
      importLabel () {
        storage.get('label.json', (err, labelJson) => {
          if (err) throw err
          fs.readFile(labelJson.path, 'utf8', (err, labelXml) => {
            if (err) throw err
            this.label = this.dymo.openLabelXml(labelXml.trim())
            this.setupLabel()
            this.loading = false
          })
        })
      },
      setupLabel () {
        if (this.label && this.product) {
          const objectNames = this.label.getObjectNames()
          const textObjects = objectNames.map(name => {
            return { name, text: this.label.getObjectText(name) }
          })

          const labelParams = {
            'productName': this.product.item.name,
            'readyDate': moment().add(this.product.item.defrost, 'hours').format('ddd DD/MM/YYYY'),
            'readyTime': moment().add(this.product.item.defrost, 'hours').format('h:mma'),
            'useByDate': moment().add(this.product.item.shelfLife, 'hours').format('ddd DD/MM/YYYY'),
            'useByTime': moment().add(this.product.item.shelfLife, 'hours').format('h:mma')
          }

          Object.entries(labelParams).forEach(([key, value]) => {
            let match = textObjects.find(textObject => textObject.text.toLowerCase().includes(key.toLowerCase()))
            if (match) this.label.setObjectText(match.name, value)
          })

          const pngData = this.label.render()
          if (pngData) {
            this.imgSrc = 'data:image/png;base64,' + pngData
          }
        }
      },
      handlePrint () {
        if (this.label && this.selectedPrinter) {
          const printParams = this.dymo.createLabelWriterPrintParamsXml({
            copies: this.form.quantity,
            jobTitle: this.product.name + ' labels'
          })
          this.label.print(this.selectedPrinter.modelName, printParams)
        }
      },
      hideModal () {
        this.form = { printer: 0, quantity: 1 }
        this.$refs.modal.hide()
      },
      getProductTimeString (label, hours) {
        const time = moment().add(this.product.item.defrost, 'hours')
        let timeString = label + '\n'
        timeString += time.format('ddd DD/MM/YYYY') + '\n'
        timeString += time.format('h:mma')
        return timeString
      }
    }
  }
</script>