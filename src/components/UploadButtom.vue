<template>
  <div class="mainContainer">
    <table>
      <tr>
        <td>
          <label>Upload file: </label>
          <input id="fileInput" type="file" @change="handleFile" accept=".xml"/>
          <button @click="send">Upload</button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import type { ItemXml } from '@/models/ItemXml';
import type { DanfeDto } from '@/models/DanfeDto';
import type { XmlRequest } from '@/models/XmlRequest';

import axios from 'axios';
import { ref } from 'vue';
  export default {
    data(){
      return {
        xml: ref<any>(),
        itens :ref<ItemXml>([]),
        request : ref<XmlRequest>(),
        danfe : ref<DanfeDto>({xml: ''})
      }
    },
    methods:{
      async send(){
        const url = 'http://localhost:8080/xml/calculate';
        
        const items: Array<ItemXml> = [{
          codProduto: 23744,
          quantidade: 1
        }]

        const xml = this.xml

        this.request = { xml: xml, items: items}
        
        let resp: string = '';
        
        let xmlCalculated = await axios.post(url, this.request,{headers:{
          "Content-Type":'application/json'
        }}).then(res => {
          resp = res.data.xml as string
          console.log( resp)
          return resp;
        })

        console.log(xmlCalculated);
        
        
        this.danfe.xml = xmlCalculated;
        
        this.submitDanfe(this.danfe);

      },

      submit(url: string, submitData: XmlRequest) {
        console.log(JSON.stringify(submitData))
        
        const response = axios.post(url, submitData,{headers:{
          "Content-Type":'application/json'
        }})
          .then(response => {
          console.log("xml received " + JSON.stringify(response.data));
          if(response.data == true){
            alert('');
            return response.data.xml;
          }
          else
          alert('');
      })
      .catch(error => {
          console.log('error:' + error);
      });
        
      },

      async submitDanfe(submitData: DanfeDto) {
        console.log(JSON.stringify(submitData))
        
        let response = await axios.post("http://localhost:8080/xml/danfe", submitData,{headers:{
          "Content-Type":'application/json'
        }, responseType: 'blob'})

          if (response){
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'danfe.pdf'); //or any other extension
            document.body.appendChild(link);
            link.click();
          }
      },

      handleFile(){
        var fileInput = document.getElementById('fileInput') as any;
        var file = fileInput.files[0];
        var reader = new FileReader();
        var self = this as any;
        reader.addEventListener('load', function(){
          self.xml = reader.result;
        });
        reader.readAsText(file);
      }
    }
  }
</script>