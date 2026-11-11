import React from 'react';
import {
  HiBuildingOffice2,
  HiBuildingOffice,
  HiHome,
  HiMapPin,
  HiSparkles,
  HiUsers,
  HiUser,
  HiUserPlus,
  HiTrophy,
  HiBell,
  HiFire,
  HiMagnifyingGlass,
  HiFunnel,
  HiPlus,
  HiPlusCircle,
  HiCheck,
  HiCheckCircle,
  HiCheckBadge,
  HiXMark,
  HiBars3,
  HiChevronDown,
  HiChevronRight,
  HiChevronUp,
  HiPhone,
  HiChatBubbleLeftRight,
  HiArrowRight,
  HiArrowUpRight,
  HiArrowsUpDown,
  HiArrowTopRightOnSquare,
  HiPencilSquare,
  HiTrash,
  HiBookOpen,
  HiShieldCheck,
  HiShieldExclamation,
  HiCalendarDays,
  HiClock,
  HiCurrencyDollar,
  HiBanknotes,
  HiArrowTrendingUp,
  HiFlag,
  HiAcademicCap,
  HiBriefcase,
  HiSquare3Stack3D,
  HiPaperAirplane,
  HiGlobeAmericas,
  HiTag,
  HiShare,
  HiEye,
  HiEyeSlash,
  HiDocumentText,
  HiDocumentCheck,
  HiCamera,
  HiArrowUpTray,
  HiArrowDownTray,
  HiPrinter,
  HiKey,
  HiLockClosed,
  HiArrowRightOnRectangle,
  HiEnvelope,
  HiArrowsPointingOut,
  HiDevicePhoneMobile,
  HiExclamationCircle,
  HiExclamationTriangle,
  HiQuestionMarkCircle,
  HiArrowPath
} from 'react-icons/hi2';

import {
  RiHotelBedLine,
  RiWhatsappFill,
  RiWhatsappLine
} from 'react-icons/ri';

// Wrapper helper ensuring Tailwind classes, stroke-width and inline layout behave consistently
const createIcon = (Component) => {
  return function IconWrapper({ className = '', size, ...props }) {
    return <Component className={`inline-block shrink-0 ${className}`} size={size} {...props} />;
  };
};

export const Building2 = createIcon(HiBuildingOffice2);
export const Building = createIcon(HiBuildingOffice);
export const Home = createIcon(HiHome);
export const MapPin = createIcon(HiMapPin);
export const Sparkles = createIcon(HiSparkles);
export const Users = createIcon(HiUsers);
export const User = createIcon(HiUser);
export const UserCheck = createIcon(HiCheckBadge);
export const UserPlus = createIcon(HiUserPlus);
export const Trophy = createIcon(HiTrophy);
export const Bell = createIcon(HiBell);
export const Flame = createIcon(HiFire);
export const Search = createIcon(HiMagnifyingGlass);
export const Filter = createIcon(HiFunnel);
export const Plus = createIcon(HiPlus);
export const PlusSquare = createIcon(HiPlusCircle);
export const Check = createIcon(HiCheck);
export const CheckCircle2 = createIcon(HiCheckCircle);
export const CheckCheck = createIcon(HiCheckBadge);
export const X = createIcon(HiXMark);
export const Menu = createIcon(HiBars3);
export const ChevronDown = createIcon(HiChevronDown);
export const ChevronRight = createIcon(HiChevronRight);
export const ChevronUp = createIcon(HiChevronUp);
export const Phone = createIcon(HiPhone);
export const MessageSquare = createIcon(HiChatBubbleLeftRight);
export const ArrowRight = createIcon(HiArrowRight);
export const ArrowUpRight = createIcon(HiArrowUpRight);
export const ArrowUpDown = createIcon(HiArrowsUpDown);
export const ExternalLink = createIcon(HiArrowTopRightOnSquare);
export const Edit3 = createIcon(HiPencilSquare);
export const Trash2 = createIcon(HiTrash);
export const BookOpen = createIcon(HiBookOpen);
export const ShieldCheck = createIcon(HiShieldCheck);
export const Shield = createIcon(HiShieldCheck);
export const ShieldAlert = createIcon(HiShieldExclamation);
export const Calendar = createIcon(HiCalendarDays);
export const CalendarDays = Calendar;
export const Clock = createIcon(HiClock);
export const DollarSign = createIcon(HiBanknotes);
export const TrendingUp = createIcon(HiArrowTrendingUp);
export const Target = createIcon(HiFlag);
export const Award = createIcon(HiAcademicCap);
export const Briefcase = createIcon(HiBriefcase);
export const Layers = createIcon(HiSquare3Stack3D);
export const Navigation = createIcon(HiPaperAirplane);
export const Compass = createIcon(HiGlobeAmericas);
export const Tag = createIcon(HiTag);
export const Share2 = createIcon(HiShare);
export const Eye = createIcon(HiEye);
export const EyeOff = createIcon(HiEyeSlash);
export const FileText = createIcon(HiDocumentText);
export const FileCheck = createIcon(HiDocumentCheck);
export const Camera = createIcon(HiCamera);
export const Upload = createIcon(HiArrowUpTray);
export const Download = createIcon(HiArrowDownTray);
export const Printer = createIcon(HiPrinter);
export const Key = createIcon(HiKey);
export const Lock = createIcon(HiLockClosed);
export const LogIn = createIcon(HiArrowRightOnRectangle);
export const Mail = createIcon(HiEnvelope);
export const Globe = createIcon(HiGlobeAmericas);
export const Maximize2 = createIcon(HiArrowsPointingOut);
export const Send = createIcon(HiPaperAirplane);
export const Smartphone = createIcon(HiDevicePhoneMobile);
export const AlertCircle = createIcon(HiExclamationCircle);
export const AlertTriangle = createIcon(HiExclamationTriangle);
export const HelpCircle = createIcon(HiQuestionMarkCircle);
export const RefreshCw = createIcon(HiArrowPath);
export const Bed = createIcon(RiHotelBedLine);
export const WhatsApp = createIcon(RiWhatsappFill);

export default {
  Building2, Building, Home, MapPin, Sparkles, Users, User, UserCheck, UserPlus,
  Trophy, Bell, Flame, Search, Filter, Plus, PlusSquare, Check, CheckCircle2,
  CheckCheck, X, ChevronDown, ChevronRight, ChevronUp, Phone, MessageSquare,
  ArrowRight, ArrowUpRight, ArrowUpDown, ExternalLink, Edit3, Trash2, BookOpen,
  ShieldCheck, Shield, ShieldAlert, Calendar, Clock, DollarSign, TrendingUp,
  Target, Award, Briefcase, Layers, Navigation, Compass, Tag, Share2, Eye, EyeOff,
  FileText, FileCheck, Camera, Upload, Download, Printer, Key, Lock, LogIn, Mail,
  Maximize2, Send, Smartphone, AlertCircle, AlertTriangle, HelpCircle, RefreshCw,
  Bed, WhatsApp
};
