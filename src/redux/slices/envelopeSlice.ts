import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    envelopeDocumentsTitle: [],
    envelopeDocuments: [],
    envelopeDocumentsData: [],
    snapshotDetails: [],
    allSnapshots: {},
    allPages: [],
    allFields:[],

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

         setField: (state, action) => {
            state.allFields = [
        ...state.allFields,
        action.payload
    ];
        },
        setAllFields: (state, action) => {
            state.allFields = action.payload;
        },

        setRecipients: (state, action) => {
            state.addRecipientsBox = [
        ...state.addRecipientsBox,
        action.payload
    ];
        },


        updateRecipientById: (state, action) => {
    const { id, data } = action.payload;

    state.addRecipientsBox = state.addRecipientsBox.map((recipient) =>
        recipient.id === id
            ? { ...recipient, ...data }
            : recipient
    );
        },
        
        deleteRecipientById: (state, action) => {
    const id = action.payload;

    state.addRecipientsBox = state.addRecipientsBox.filter(
        (recipient) => recipient.id !== id
    );
},

        setDocuments: (state, action) => {
           state.envelopeDocuments = [
        ...state.envelopeDocuments,
        ...action.payload
    ];
        },
          deleteDocumentByIndex: (state, action) => {
    const index = action.payload;

                 state.envelopeDocuments.splice(index, 1);

        
        },
          removeErrorDocuments: (state) => {
  state.envelopeDocuments = state.envelopeDocuments.filter(
    doc => !doc.error
  );
},
        updateDocumentByIndex: (state, action) => {
    const { index, data } = action.payload;

    if (state.envelopeDocuments[index]) {
        state.envelopeDocuments[index] = {
            ...state.envelopeDocuments[index],
            ...data,
        };
    }
},

        setDocumentsData: (state, action) => {
            state.envelopeDocumentsData = action.payload;
        },

         setRecipientsBulk: (state, action) => {
            state.addRecipientsBox = action.payload;
        },
        setLanguage: (state, action) => {
            state.envelope_language = action.payload;
        },
        setEnableWritingID: (state, action) => {
             state.enable_writing_id = action.payload;
        },
        setIamSigner: (state, action) => {
          state.im_signer = action.payload  
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
    setEnableWritingID,
    updateDocumentByIndex,
    updateRecipientById,
    deleteRecipientById,
    setRecipientsBulk,
    deleteDocumentByIndex,
    removeErrorDocuments,
    setField, setAllFields,
    setIamSigner
} = envelopeSlice.actions;

export default envelopeSlice.reducer;