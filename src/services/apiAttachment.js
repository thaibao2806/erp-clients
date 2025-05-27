import axios from "axios"
import { addAttachment, url } from "../config/config"

const addAttachments = (formData,token) => {
    return axios.post(url + addAttachment, formData, {
        headers:{
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
        }
    })
}

export const getAttachments = (refId, refType, token) => {
  return axios.get(url + "/api/v1/khkd/attachments", {
    params: { refId, refType },
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const downloadAttachments = (id, fileName, token) => {
  return axios
    .get(url + `/api/v1/khkd/attachments/download/${id}`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
};

export {
    addAttachments
}