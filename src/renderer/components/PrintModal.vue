<template>
    <b-modal
      id="printModal"
      :visible="true"
      title="Print Label"
      @ok="handlePrint"
      >
      <div v-if="loading" class="text-center">
        <b-spinner label="Loading..."></b-spinner>
      </div>
      <div v-else-if="error" class="text-center">
        {{error}}
      </div>
      <b-container v-else>
        <b-row>
          <b-col>
            <img v-if="imgSrc" id="labelImg" :src="imgSrc" alt="Label Preview" />
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col>
            <form ref="form" @submit.stop.prevent="hideModal">
              <b-form-group
                id="printer-group"
                label="Printer:"
                label-for="printer-input">
                <b-form-select
                  v-model="form.printer"
                  :options="printerOptions" />
              </b-form-group>
              <b-form-group
                id="quantity-group"
                label="Quantity:"
                label-for="quantity-input">
                <b-form-input
                  v-model="form.quantity"
                  type="number"
                  min="1" />
              </b-form-group>
            </form>
          </b-col>
        </b-row>
      </b-container>
      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button variant="danger" @click="cancel()">
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
        loading: true,
        interval: null,
        validEnvironment: false,
        error: null
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
      this.initDymo()
    },
    methods: {
      initDymo () {
        this.loading = true
        if (this.dymo) {
          this.handleSetup()
        } else {
          this.interval = setInterval(() => {
            if (window && window.dymo) {
              this.dymo = window.dymo.label.framework
              this.dymo.trace = true
              this.dymo.init(this.handleSetup)
              clearInterval(this.interval)
            }
          })
        }
      },
      handleSetup () {
        if (!this.dymo) return
        const environment = this.dymo.checkEnvironment()
        if (environment.errorDetails) {
          this.error = environment.errorDetails || 'There was an issue connecting to the printer.'
          return
        }
        this.printers = this.dymo.getPrinters()
        if (!this.printers.length) {
          this.error = 'No DYMO printers are installed. Install DYMO printers.'
          return
        }
        this.importLabel()
        this.loading = false
      },
      importLabel () {
        storage.get('label.json', (err, labelJson) => {
          if (err) {
            this.error = err
            throw err
          }

          if (!labelJson || !labelJson.path) {
            this.error = 'Please provide a label template. Go to File > Import Dymo Label and select a dymo label created via DYMO Connect.'
            return
          }

          if (labelJson.path.indexOf('/') >= 0 || labelJson.path.indexOf('\\') >= 0) {
            this.label = this.dymo.openLabelFile(labelJson.path)
            this.setupLabel()
            return
          }

          fs.readFile(labelJson.path, 'utf8', (err, labelXml) => {
            if (err) {
              this.error = `There was an issue loading the label template. Please check the template still exists at: "${labelJson.path}"`
              throw err
            }
            this.label = this.dymo.openLabelXml(labelXml)
            this.setupLabel()
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
            'productName': this.product.name,
            'readyDate': moment().add(this.product.defrost, 'hours').format('ddd DD/MM/YY'),
            'readyTime': moment().add(this.product.defrost, 'hours').format('h:mma'),
            'useByDate': moment().add(this.product.shelfLife, 'hours').format('ddd DD/MM/YY'),
            'useByTime': moment().add(this.product.shelfLife, 'hours').format('h:mma')
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
      getProductTimeString (label, hours) {
        const time = moment().add(this.product.defrost, 'hours')
        let timeString = label + '\n'
        timeString += time.format('ddd DD/MM/YYYY') + '\n'
        timeString += time.format('h:mma')
        return timeString
      }
    }
  }
</script>