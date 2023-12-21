<template>
  <div id="main">
      <div class="button-container">
        <label>Upload file: </label>
        <input id="fileInput" type="file" @change="handleFile" accept=".xml" />
        <button @click="receiveProductsFromXml">Buscar Produtos</button>
      </div>

    <br />

    <SearchForm @search="handleSearch" />

    <div class="container mt-5 table-responsive table-container">
      <Suspense>
        <table id="tableProd" class="table table table-striped table-bordered table-sm" data-search="true"
          data-click-to-select="true">
            <thead>
            <tr>
              <th>
                <div class="selecionar-todos d-flex flex-column">
                  <label for="scales">Selecionar</label>
                  <div>
                    <input type="checkbox" id="scales" v-model="selectAll" @change="selecionarTodosItens" />
                  </div>
                </div>
              </th>
              <th>codigo</th>
              <th>Quantidade Original</th>
              <th>Quantidade Devolvida</th>
            </tr>
          </thead>
          <tbody v-if="itens && itens.length > 0">
            <tr v-for="(item, index) in filteredItems" :key="index">
              <div class="checkbox">
                <td class="td-checkbox">
                  <input class="check" type="checkbox" v-model="itensSelecionados" :value="item" />
                </td>
              </div>
              <td>{{ item.codProduto }}</td>
              <td>{{ item.quantidade }}</td>
              <td>
                <input id="inputQtd" type="number" v-model="itens[index].quantidadeDevolvida"  @input="verificaValor" min="0" placeholder="quantidade devolvida" />
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="10" align="center">
                Insira o arquivo xml da nota fiscal, em seguida clique em "Buscar Produtos"
              </td>
            </tr>
          </tbody>
        </table>
      </Suspense>
    </div>
  </div>
  <button @click="send" class="btn btn-success">Enviar Requisição</button>
</template>

<script lang="ts" setup>
//@ts-nocheck
import type { DanfeDto } from "@/models/DanfeDto";
import type { FormReq } from "@/models/FormReq";
import type { ItemXml } from "@/models/ItemXml";
import type { XmlRequest } from "@/models/XmlRequest";
import SearchForm from "@/components/SearchForm.vue"
import { computed, ref, watch } from "vue";
import { getKeycloakInstance } from '@/services/keycloakService'
import axios from "axios";

const xml = ref<any>();
const itens = ref<ItemXml>([]);
const itensSelecionados = ref<ItemXml>([]);
const request = ref<XmlRequest>();
const danfe = ref<DanfeDto>({ xml: "" });
const selectAll = ref(false);
const xmlCalculated = ref<any>();
const reqDev = ref<FormReq>([]);
const canSubmit = ref(true);
const searchFilter = ref('');
// const keycloack = getKeycloakInstance();

watch([itensSelecionados, itens], () => {
  return selectAll.value = itensSelecionados.value.length === itens.value.length;
});

watch('produtoSelecionado', (novoProduto) => {
  // Atualize o valor do input quando o produto selecionado mudar
  this.$refs.inputProduto.value = novoProduto.valor;
});

const filteredItems = computed(() => {
  
  if (searchFilter.value !== '') {
    console.log(typeof(searchFilter.value));
    console.log(itens.value.filter(item => Number(item.codProduto) === Number(searchFilter.value)));
  
    const searchValue = searchFilter.value;
  
    return itens.value.filter(item => {
      const codProduto = String(item.codProduto).toLowerCase();
      return codProduto.includes(searchValue);
    });
  }
  console.log("fora if");
  
  console.log(itens.value);
  
  return itens.value;
})

const handleSearch = (search) =>{
  console.log(search);
  
  searchFilter.value = search
}

const verificaValor = () =>{
  const selecionadosLen = itensSelecionados.value.length - 1;
  canSubmit.value = itensSelecionados.value[selecionadosLen].quantidadeDevolvida <= itensSelecionados.value[selecionadosLen].quantidade;

  if (!canSubmit.value) {
    console.error("Quantidade devolvida maior que a quantidade original!");
  }
}

async function send() {
  const xml_v = xml.value;

  console.log("length");
  console.log(itensSelecionados.value.length)

  if (!reqDev.value) {
    reqDev.value = [];
  }

  for (let i = 0; i < itensSelecionados.value.length; i++) {
    // Inicialize reqDev.value[i] como um objeto vazio, se não estiver definido
    if (!reqDev.value[i]) {
      reqDev.value[i] = {};
    }

    reqDev.value[i].codProduto = itensSelecionados.value[i].codProduto;
    reqDev.value[i].quantidade = itensSelecionados.value[i].quantidadeDevolvida == null
    ? itensSelecionados.value[i].quantidade
    : itensSelecionados.value[i].quantidadeDevolvida;
  }

  console.log(xml_v);
  
  request.value = { xml: xml_v, items: reqDev.value };

  await receiveXmlCalculated(request.value);

  danfe.value.xml = xmlCalculated;
  await submitDanfe(danfe.value);
};

async function receiveXmlCalculated(request) {
  // await keycloack.updateToken(30)
  await axios
    .post("http://localhost:8080/xml/calculate", request, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then((res) => {
      xmlCalculated.value = res.data.xml as string;
    });
};

async function receiveProductsFromXml() {
  const xml_t = await xml.value;
  // await keycloack.updateToken(30)
  const xml_req = { xml: xml_t }
  let response = await axios.post(
    "http://localhost:8080/xml/products",
    xml_req,
    {
      headers: {
        "Content-Type": "application/json"
      }
    })
  if (response) {
    itens.value = response.data;
    return itens.value;
  }
};

async function submitDanfe(submitData: DanfeDto) {
  // await keycloack.updateToken(30)
  let response = await axios.post(
    "http://localhost:8080/xml/danfe",
    submitData,
    {
      headers: {
        "Content-Type": "application/json"
      },
      responseType: "blob"
    }
  );
  if (response) {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "danfe.pdf"); //or any other extension
    document.body.appendChild(link);
    link.click();
  }
};

async function handleFile () {
  console.log("file select");
  
  var fileInput = document.getElementById("fileInput") as any;
  var file = fileInput.files[0];
  var reader = new FileReader();
  var self = xml;
  reader.addEventListener("load", function () {
    self.value =  reader.result;
  });
  reader.readAsText(file);
};

function selecionarTodosItens() {
  selectAll.value = !(itensSelecionados.value.length === itens.value.length);
  console.log("selec all " + selectAll.value);

  if (selectAll.value) {
    itensSelecionados.value = [...itens.value];
  } else {
    itensSelecionados.value = [];
  }
};
</script>

<style scoped>
.table-container {
  max-width: 100%;
  min-height: 100px;
  max-height: 400px;
  overflow-y: auto;
}

.table-container th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.selecionar-todos {
  display: flex;
  justify-content: space-evenly;
  flex-direction: column;
  align-items: center;
}

.checkbox {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  min-height: 100%;
  min-width: 100%;
}

.td-checkbox {
  height: 100%;
}

.check input {
  display: block;
  min-width: 100%;
  color: rgb(234, 36, 36);

  .check:hover:checked {
    color: rgb(17, 24, 17);
  }
}
.search-bar{
  position: absolute;
  left: 1%;
}

.button-container{
  /* display: flex; */
  gap: 5px;
}

.button-container input[type="file"]{
  padding: 10px;
  width: 150px;
  background-color: rgb(42, 104, 17) ;
  color: #FFF;
  
  text-align: center;
  display: block;
  margin: 10px 20px;
  cursor: pointer;
}

.button-container label{

}

.button-container button{
  margin: 10px 20px;
  width: 150px;
  height: 45px;
}
</style>@/models/formReq