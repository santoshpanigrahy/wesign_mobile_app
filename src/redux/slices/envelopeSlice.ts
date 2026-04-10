import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    envelopeDocumentsTitle: [],
    envelopeDocuments: [],
    envelopeDocumentsData: [],
    snapshotDetails: [],
    allSnapshots: {},
    allPages: [],

    addRecipientsBox: [
        
    ],

    subject: "",
    message: "",
    isAutoReminder: false,
    autoReminderDay: "1",
    number_of_reminders: "0",
    enableComments: false,
    days: 120,
    expiryDate: null,

    documentsDetails: {},
    envelope_language: "english",
    envelopeStatus: "drafts",
    im_signer: false,
    metaData: [],
    draft_envelope_id: null,
    start_document_upload: false,
    documentsDetailsId: 0,
    set_signing_order: false,
    zoom_value: "Fit To Width",
    is_use_template: false,
    manage_envelope_tabs: "inbox",
    manage_envelope_page: 1,
    enable_writing_id: true,
    enable_ordering: null,
    enable_certification: true,
    detected_fields: false,
};

const envelopeSlice = createSlice({
    name: "envelope",
    initialState,

    reducers: {
        setSubject: (state, action) => {
            state.subject = action.payload;
        },

        setMessage: (state, action) => {
            state.message = action.payload;
        },

        setRecipients: (state, action) => {
            state.addRecipientsBox = action.payload;
        },

        setDocuments: (state, action) => {
            state.envelopeDocuments = action.payload;
        },

        setDocumentsData: (state, action) => {
            state.envelopeDocumentsData = action.payload;
        },

        setLanguage: (state, action) => {
            state.envelope_language = action.payload;
        },

        setExpiryDate: (state, action) => {
            state.expiryDate = action.payload;
        },

        setEnvelopeStatus: (state, action) => {
            state.envelopeStatus = action.payload;
        },

        setMetaData: (state, action) => {
            state.metaData = action.payload;
        },

        setDraftId: (state, action) => {
            state.draft_envelope_id = action.payload;
        },

        setSnapshots: (state, action) => {
            state.snapshotDetails = action.payload;
        },

        setAllSnapshots: (state, action) => {
            state.allSnapshots = action.payload;
        },

        setAllPages: (state, action) => {
            state.allPages = action.payload;
        },

        setSigningOrder: (state, action) => {
            state.set_signing_order = action.payload;
        },

        setZoom: (state, action) => {
            state.zoom_value = action.payload;
        },

        setTemplate: (state, action) => {
            state.is_use_template = action.payload;
        },

        setDetectedFields: (state, action) => {
            state.detected_fields = action.payload;
        },

        resetEnvelope: () => initialState,

        loadEnvelope: (state, action) => {
            return { ...state, ...action.payload };
        },
    },
});

export const {
    setSubject,
    setMessage,
    setRecipients,
    setDocuments,
    setDocumentsData,
    setLanguage,
    setExpiryDate,
    setEnvelopeStatus,
    setMetaData,
    setDraftId,
    setSnapshots,
    setAllSnapshots,
    setAllPages,
    setSigningOrder,
    setZoom,
    setTemplate,
    setDetectedFields,
    resetEnvelope,
    loadEnvelope,
} = envelopeSlice.actions;

export default envelopeSlice.reducer;