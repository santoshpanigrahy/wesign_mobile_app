import AttachmentMeta from '@screens/canvas/components/fieldMeta/AttachmentMeta';
import CheckboxMeta from '@screens/canvas/components/fieldMeta/CheckboxMeta';
import DateMeta from '@screens/canvas/components/fieldMeta/DateMeta';
import DropdownMeta from '@screens/canvas/components/fieldMeta/DropdownMeta';
import InitialMeta from '@screens/canvas/components/fieldMeta/InitialMeta';
import NoteMeta from '@screens/canvas/components/fieldMeta/NoteMeta';
import RadioMeta from '@screens/canvas/components/fieldMeta/RadioMeta';
import SignatureMeta from '@screens/canvas/components/fieldMeta/SignatureMeta';
import TextMeta from '@screens/canvas/components/fieldMeta/TextMeta';
import {
  PenLine,
  Pencil,
  Stamp,
  CalendarDays,
  User,
  Mail,
  Building,
  Type,
  FileText,
  CheckSquare,
  ChevronDown,
  Signature,
  CaseUpper,
  CircleDot,
  Palette,
  Paperclip
} from 'lucide-react-native';

export const FIELD_CONFIG = {
  signature: {
    label: "Signature",
    icon: Signature,
    width: 100,
    height: 30,
  },
  initial: {
    label: "Initial",
    icon: CaseUpper,
    width: 100,
    height: 30,
  },
  stamp: {
    label: "Stamp",
    icon: Stamp,
    width: 65,
    height: 65,
  },
  date_signed: {
    label: "Date",
    icon: CalendarDays,
    width: 100,
    height: 30,
  },
  full_name: {
    label: "Name",
    icon: User,
    width: 200,
    height: 60,
  },
  email: {
    label: "Email",
    icon: Mail,
    width: 200,
    height: 60,
  },
  company: {
    label: "Company",
    icon: Building,
    width: 100,
    height: 30,
  },
  title: {
    label: "Only For Recipient",
    icon: Type,
    width: 150,
    height: 30,
  },
  comment_text: {
    label: "Only For Recipient",

    icon: FileText,
    width: 150,
    height: 30,
  },
  plain_text: {
    label: "Write Here",
    icon: FileText,
    width: 200,
    height: 80,
  },
  checkbox: {
    label: "Checkbox",
    icon: CheckSquare,
    width: 20,
    height: 20,
  },
  dropdown: {
    label: "Dropdown",
    icon: ChevronDown,
    width: 100,
    height: 30,
  },
  radio: {
    label: "Radio",
    icon: CircleDot,
    width: 20,
    height: 20,
  },
  drawing: {
    label: "Drawing",
    icon: Palette,
    width: 100,
    height: 30,
  },

  attachment: {
    label: "Attachment",
    icon: Paperclip,
    width: 120,
    height: 30,
  },
};

export const FIELD_TYPES = Object.keys(FIELD_CONFIG).map((type) => ({
  type,
  label: FIELD_CONFIG[type].label,
}));

export const getFieldIcon = (type) =>
  FIELD_CONFIG[type]?.icon;

export const getFieldLabel = (type) =>
  FIELD_CONFIG[type]?.label || 'Field';

export const getFieldDefaults = (type) =>
  FIELD_CONFIG[type] || { width: 80, height: 30 };


export const FIELD_META_COMPONENTS = {
  signature: SignatureMeta,
  initial: InitialMeta,
  date_signed: DateMeta,
  comment_text: TextMeta,
  plain_text: NoteMeta,
  checkbox: CheckboxMeta,
  dropdown: DropdownMeta,
  attachment: AttachmentMeta,
  radio: RadioMeta
};


export const BASIC_COLORS = [
  "rgb(0,0,0)",       // black
  "rgb(33, 84, 160)", // blue
  "rgb(239, 68, 68)", // red
  "rgb(16, 185, 129)",// green
  "rgb(255,255,255)"  // white
];

const GRAYS = [
  // "rgb(245,245,245)",
  // "rgb(230,230,230)",
  "rgb(200,200,200)",
  "rgb(170,170,170)",
  "rgb(140,140,140)",
  "rgb(110,110,110)",
  "rgb(80,80,80)",
  "rgb(50,50,50)",
  "rgb(30,30,30)"
];

const BLUES = [
  // "rgb(219,234,254)",
  "rgb(191,219,254)",
  "rgb(147,197,253)",
  "rgb(96,165,250)",
  "rgb(59,130,246)",
  "rgb(37,99,235)",
  "rgb(29,78,216)",
  "rgb(30,64,175)"
];

const GREENS = [
  // "rgb(220,252,231)",
  "rgb(187,247,208)",
  "rgb(134,239,172)",
  "rgb(74,222,128)",
  "rgb(34,197,94)",
  "rgb(22,163,74)",
  "rgb(21,128,61)",
  "rgb(20,83,45)"
];

const REDS = [
  // "rgb(254,226,226)",
  "rgb(254,202,202)",
  "rgb(252,165,165)",
  "rgb(248,113,113)",
  "rgb(239,68,68)",
  "rgb(220,38,38)",
  "rgb(185,28,28)",
  "rgb(127,29,29)"
];

const YELLOWS = [
  // "rgb(254,249,195)",
  "rgb(254,240,138)",
  "rgb(253,224,71)",
  "rgb(250,204,21)",
  "rgb(234,179,8)",
  "rgb(202,138,4)",
  "rgb(161,98,7)",
  "rgb(133,77,14)"
];

const ORANGES = [
  // "rgb(255,237,213)",
  "rgb(254,215,170)",
  "rgb(253,186,116)",
  "rgb(251,146,60)",
  "rgb(249,115,22)",
  "rgb(234,88,12)",
  "rgb(194,65,12)",
  "rgb(124,45,18)"
];

const PURPLES = [
  // "rgb(243,232,255)",
  "rgb(221,214,254)",
  "rgb(196,181,253)",
  "rgb(167,139,250)",
  "rgb(139,92,246)",
  "rgb(124,58,237)",
  "rgb(109,40,217)",
  "rgb(88,28,135)"
];

const PINKS = [
  // "rgb(252,231,243)",
  "rgb(251,207,232)",
  "rgb(249,168,212)",
  "rgb(244,114,182)",
  "rgb(236,72,153)",
  "rgb(219,39,119)",
  "rgb(190,24,93)",
  "rgb(131,24,67)"
];

export const ALL_COLORS = [
  ...GRAYS,
  ...BLUES,
  ...GREENS,
  ...REDS,
  // ...YELLOWS,
  ...ORANGES,
  // ...PURPLES,
  ...PINKS
];


export const TEXT_STYLE_ELIGIBLE = ['date_signed', 'name', 'email', 'company', 'title', 'comment_text', 'plain_text'];

export const PREFILLED_FIELDS = ['my_signature', 'my_initial', 'my_stamp', 'my_date_signed', 'my_full_name', 'my_email', 'my_company', 'plain_text'];
export const IAMSIGNER_FIELDS = ['signature', 'initial', 'stamp', 'date_signed', 'full_name', 'first_name', 'last_name', 'email', 'company', 'title'];

