// services/documentService.js

import api from "./api";

export const getDocumentListing = async (document_keys) => {

  // console.log(document_keys)
  const res = await api.post('/api/document/listing', {
    document_keys,
  });
  // console.log(res.data.documents);

  // console.log(res)

  if (!res.data.status) throw new Error(res.data.message);

  return res.data.documents;
};

export const getDocumentUrl = async (document_key) => {
  // console.log(document_key);

  const res = await api.get(`/api/access/document/snapshot/revised?key=${document_key}&type=image`);

  // console.log(res);

  if (!res.data.status) throw new Error(res.data.message);

  // console.log(res.data);

  return res.data?.signed_urls;
};