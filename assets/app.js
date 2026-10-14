/* Tradeplace demo portal.
   Same modules, same table names, same column headers and wordings as the
   production portal it was specced from. The LAYOUT is deliberately different:
   summary strip instead of stat cards, segmented controls instead of tabs,
   filters behind a toggle, a sticky context column instead of stacked cards.
   All figures, IDs, invoice numbers and client names below are invented. */
(function () {
"use strict";

/* ---------- formatting ---------- */
var D = function (n, z) { var v = Number(n); return '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: z === 0 ? 0 : 2, maximumFractionDigits: z === 0 ? 0 : 2 }); };
var SD = function (n) { return (Number(n) < 0 ? '-' : '') + D(n); };
var PN = function (n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
var N  = function (n) { return Number(n).toLocaleString('en-US'); };
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
/* Identifiers render partially masked: first four characters, ***, last three.
   B0C4KN2QLD -> B0C4***QLD. Placeholders ("-") and short values are left alone. */
var mk = function (v) {
  var s = String(v);
  if (s.length < 8 || !/^[A-Za-z0-9]+$/.test(s)) return esc(s);
  return esc(s.slice(0, 4) + '***' + s.slice(-3));
};

/* ---------- icons ---------- */
var I = {
 grid:'<path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" stroke="currentColor" stroke-width="1.5" fill="none"/>',
 wave:'<path d="M3 13c2.5 0 2.5-6 5-6s2.5 6 5 6 2.5-6 4-6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
 clock:'<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 6v4.3l2.8 1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
 receipt:'<path d="M5 3h10v14l-2.5-1.5L10 17l-2.5-1.5L5 17z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><path d="M8 7h4M8 10h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
 gear:'<circle cx="10" cy="10" r="2.6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.2 5.2l1.4 1.4M13.4 13.4l1.4 1.4M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
 file:'<path d="M5 2.5h6l4 4V17a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 5 17z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><path d="M11 2.5V7h4" stroke="currentColor" stroke-width="1.5" fill="none"/>',
 chart:'<path d="M3 16V8M8 16V4M13 16v-5M18 16V9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
 graph:'<path d="M3 15l4.2-5 3 2.4L17 5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17" cy="5" r="1.7" fill="currentColor"/>',
 link:'<path d="M8.5 11.5a3.4 3.4 0 0 0 5 .4l2-2a3.4 3.4 0 0 0-4.8-4.8l-1.1 1.1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M11.5 8.5a3.4 3.4 0 0 0-5-.4l-2 2a3.4 3.4 0 0 0 4.8 4.8l1.1-1.1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
 down:'<path d="M10 3v9m0 0 3.4-3.4M10 12 6.6 8.6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15.5h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
 users:'<circle cx="7.6" cy="7.4" r="2.7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 16c0-2.5 2-4.2 4.6-4.2S12.2 13.5 12.2 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M13.4 6.1a2.5 2.5 0 0 1 0 4.9M14.3 11.9c1.7.4 2.7 1.8 2.7 4.1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
 doc:'<path d="M4 3h12v14H4z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
 track:'<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="m7 10 2 2 4-4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
};
var MI = {
 hrs:'<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.6V8l2.4 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
 amt:'<path d="M8 2.4v11.2M10.6 5.1C10 4.3 9.1 3.9 8 3.9c-1.5 0-2.6.8-2.6 2s1.1 1.8 2.6 2.1 2.6.9 2.6 2.1-1.1 2-2.6 2c-1.2 0-2.1-.4-2.7-1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
 fte:'<circle cx="6.2" cy="6" r="2.2" stroke="currentColor" stroke-width="1.4"/><path d="M2.4 13c0-2 1.6-3.4 3.8-3.4S10 11 10 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
 rec:'<path d="M3 4.3h10v8.4H3z" stroke="currentColor" stroke-width="1.4"/><path d="M5.2 7h5.6M5.2 9.4h3.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
 win:'<path d="M3 13l3.6-4.3 2.6 2L13.4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
};
var mico = function (p) { return '<span class="ic"><svg width="15" height="15" viewBox="0 0 16 16" fill="none">' + p + '</svg></span>'; };
var A_INFO = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" fill="currentColor"/><path d="M8 7.2v3.6M8 5.1v1" stroke="var(--surface)" stroke-width="1.5" stroke-linecap="round"/></svg>';
var A_DL   = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2.6v7m0 0 2.6-2.6M8 9.6 5.4 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12.4h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
var A_EDIT = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.1 2.9a1.5 1.5 0 0 1 2.1 2.1L5.6 12.6l-2.8.7.7-2.8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
var A_DEL  = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.2 4.4h9.6M6.4 4.4V3.1h3.2v1.3M4.5 4.4l.6 8.2h5.8l.6-8.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* =========================================================================
   DEMO DATA — column names and wordings mirror production; figures invented
   ========================================================================= */
var OG = {
 Approved:{n:916,cols:['Payment Number','Dispute ID','PO','PO Dates','Dispute Type','Dispute Date','Dispute Status','Dispute Amount','Approved Amount (As Per Vc)','Invoice Number','Invoice Dates'],
  rows:[['-','DSPT10444658271','2T2BIY3Z','06/01/2026','Shortage invoice','08/09/26','Approved',659.95,395.97,'PTM-A02-42961SCRSCRSCR','-'],
        ['367728578','DSPT12105602911','-','-','Shortage Invoice Re-Dispute','08/05/26','Approved',458.97,458.97,'PTM-A03-42213SCRSCR','-'],
        ['-','DSPT11644229727','7IMISFVH','05/11/2026','Shortage invoice','08/02/26','Approved',79.51,17.99,'CPM-42448SCRSCR','-'],
        ['-','DSPT10838923359','8HXZVDED','05/18/2026','Shortage invoice','08/02/26','Approved',365.33,177.30,'CPM-42531SCR','-'],
        ['367605778','DSPT11912665183','14W3T59Z','05/18/2026','Shortage invoice','08/02/26','Approved',125.97,125.97,'CPM-42476SCR','-'],
        ['367531599','DSPT11577067615','-','-','Shortage Invoice Re-Dispute','08/01/26','Approved',791.94,791.94,'PTM-A04-42267SCRSCR','-'],
        ['-','DSPT10083930463','9QKX2MPA','04/22/2026','Shortage invoice','07/28/26','Approved',686.80,569.80,'PTM-A05-30908','-'],
        ['367372133','DSPT10687910239','-','-','Shortage Invoice Re-Dispute','07/28/26','Approved',135.99,135.99,'PTM-A06-29697','-'],
        ['-','DSPT10771763551','-','-','Shortage Invoice Re-Dispute','07/28/26','Approved',359.04,359.04,'PTM-A07-30659','-'],
        ['367298044','DSPT11204417823','3PW8KD2M','04/09/2026','Shortage invoice','07/21/26','Approved',1042.18,1042.18,'PTM-A08-29804SCR','-']],
  money:[7,8],st:6},
 /* Denied carries NO Payment Number — matches production */
 Denied:{n:1441,cols:['Dispute ID','PO','PO Dates','Dispute Type','Dispute Date','Dispute Status','Dispute Amount','Approved Amount (As Per Vc)','Invoice Number','Invoice Dates'],
  rows:[['DSPT11283519071','5JI7NRRW','06/01/2026','Shortage invoice','08/09/26','Denied',139.60,0,'PTM-A10-42949SCR','-'],
        ['DSPT10503325791','-','-','Shortage Invoice Re-Dispute','08/01/26','Denied',47.98,0,'CPM-42033SCR','-'],
        ['DSPT10117458527','-','-','Shortage Invoice Re-Dispute','07/30/26','Denied',552.44,0,'PTM-A09-43052','-'],
        ['DSPT11526785631','-','-','Shortage Invoice Re-Dispute','07/30/26','Denied',90.70,0,'PTM-A11-32146','-'],
        ['DSPT12097196383','-','-','Shortage Invoice Re-Dispute','07/28/26','Denied',205.41,0,'PTM-A05-30229','-'],
        ['DSPT10285257055','-','-','Shortage Invoice Re-Dispute','07/28/26','Denied',169.99,0,'PTM-A02-31044','-'],
        ['DSPT10973090143','-','-','Shortage Invoice Re-Dispute','07/28/26','Denied',49.40,0,'PTM-A07-31315','-'],
        ['DSPT11610624351','-','-','Shortage Invoice Re-Dispute','07/28/26','Denied',169.99,0,'PTM-A02-31043','-'],
        ['DSPT10268447071','-','-','Shortage Invoice Re-Dispute','07/28/26','Denied',26.52,0,'PTM-A07-30852','-'],
        ['DSPT10520105311','-','-','Shortage Invoice Re-Dispute','07/28/26','Denied',78.12,0,'PTM-A06-32162','-']],
  money:[6,7],st:5},
 'Pending with Amazon':{n:29,cols:['Payment Number','Dispute ID','PO','PO Dates','Dispute Type','Dispute Date','Dispute Status','Dispute Amount','Approved Amount (As Per Vc)','Invoice Number','Invoice Dates'],
  rows:[['-','DSPT10404753503','-','-','Shortage Invoice','09/12/26','Pending Amazon Action',251.97,0,'PTM-A08-44796SCR','-'],
        ['-','DSPT11008737631','-','-','Shortage Invoice','09/07/26','Pending Amazon Action',457.34,0,'CPM-44603SCR','-'],
        ['-','DSPT12032151391','-','-','Shortage Invoice','09/04/26','Pending Amazon Action',604.68,0,'CPM-44450SCR','-'],
        ['-','DSPT11025529695','-','-','Shortage Invoice','09/03/26','Pending Amazon Action',286.53,0,'CPM-44444SCR','-'],
        ['-','DSPT11092638559','-','-','Shortage Invoice','09/03/26','Pending Amazon Action',109.83,0,'CPM-44430SCR','-'],
        ['-','DSPT10639678303','-','-','Shortage Invoice','09/03/26','Pending Amazon Action',312.09,0,'CPM-44425SCR','-'],
        ['-','DSPT11545621343','-','-','Shortage Invoice','09/03/26','Pending Amazon action',20.01,0,'PTM-A07-44472SCR','-'],
        ['-','DSPT11612730207','-','-','Shortage Invoice','09/03/26','Pending Amazon action',352.73,0,'CPM-44421SCR','-'],
        ['-','DSPT10136335199','-','-','Shortage Invoice','09/03/26','Pending Amazon action',21.31,0,'CPM-44403SCR','-'],
        ['-','DSPT11623212639','-','-','Shortage Invoice','08/31/26','Pending Amazon Action',1330.56,0,'PTM-A07-44414SCR','-']],
  money:[7,8],st:6},
 Upcoming:{n:582,cols:['Invoice Number','Invoice Dates','Payment Due date','QTY Variance Amount','Actual Paid Amount','Dispute Type','Dispute Status','Estimated Dispute Date'],
  rows:[['CPM-30127SCRSCR','12/15/25','01/14/26',220.10,'-','Upcoming Shortage','Not Yet disputed','02/18/26'],
        ['CPM-30128SCR','12/15/25','01/14/26',726.33,'-','Upcoming Shortage','Not Yet disputed','02/18/26'],
        ['CPM-30130SCR','12/15/25','01/14/26',1662.81,'-','Upcoming Shortage','Not Yet disputed','02/18/26'],
        ['CPM-30215SCR','12/19/25','01/18/26',347.21,'-','Upcoming Shortage','Not Yet disputed','02/22/26'],
        ['CPM-30215SCRSCR','12/19/25','01/18/26',347.21,'-','Upcoming Shortage','Not Yet disputed','02/22/26'],
        ['CPM-30218SCRSCR','12/19/25','01/18/26',455.27,'-','Upcoming Shortage','Not Yet disputed','02/22/26'],
        ['CPM-31030SCR','02/02/26','03/04/26',83.86,'-','Upcoming Shortage','Not Yet disputed','04/08/26'],
        ['CPM-31032SCR','02/02/26','03/04/26',119.80,'-','Upcoming Shortage','Not Yet disputed','04/08/26'],
        ['CPM-31145','02/06/26','03/08/26',100.56,'-','Upcoming Shortage','Not Yet disputed','04/12/26'],
        ['CPM-31145SCR','02/06/26','03/08/26',73.38,'-','Upcoming Shortage','Not Yet disputed','04/12/26']],
  plain:[3],st:6}
};
OG.All = {n:3651,cols:OG.Approved.cols,money:[7,8],st:6,
 rows:OG.Approved.rows.slice(0,4).concat(OG['Pending with Amazon'].rows.slice(0,3))
      .concat(OG.Denied.rows.slice(0,3).map(function (r) { return ['-'].concat(r); }))};

var BREAK = [[1,'DSPT11644229727',61.52,'DSPT10075522655',0,'08/08/26','Denied','Shortage Invoice Re-Dispute'],
 [2,'DSPT10838923359',188.03,'DSPT10880829023',0,'08/08/26','Denied','Shortage Invoice Re-Dispute'],
 [3,'DSPT10083890015',47.98,'DSPT10503325791',0,'08/01/26','Denied','Shortage Invoice Re-Dispute'],
 [4,'DSPT11828720479',458.97,'DSPT12105602911',458.97,'08/01/26','Approved','Shortage Invoice Re-Dispute'],
 [5,'DSPT11426067295',791.94,'DSPT11577067615',791.94,'08/01/26','Approved','Shortage Invoice Re-Dispute'],
 [6,'DSPT12046329951',552.44,'DSPT10117458527',0,'07/30/26','Denied','Shortage Invoice Re-Dispute'],
 [7,'DSPT10133727327',1141.45,'DSPT11996506719',0,'07/30/26','Denied','Shortage Invoice Re-Dispute'],
 [8,'DSPT10033087071',1.03,'DSPT10285224287',1.03,'07/28/26','Approved','Shortage Invoice Re-Dispute'],
 [9,'DSPT11106779743',135.98,'DSPT10167783775',0,'07/28/26','Denied','Shortage Invoice Re-Dispute'],
 [10,'DSPT10670572127',26.52,'DSPT10268447071',0,'07/28/26','Denied','Shortage Invoice Re-Dispute']];

var BULK = {
 Approved:{n:130,rows:[['DSPT11257036127','Shortage Invoice Re-Dispute','10/16/25','Approved',378.80,378.80,'PTM-A08-26703','348088123'],
  ['DSPT11542248799','Shortage Invoice Re-Dispute','10/16/25','Approved',647.76,647.76,'PTM-A03-25717','348088123'],
  ['DSPT10250370399','Shortage Invoice Re-Dispute','10/16/25','Approved',283.80,283.80,'PTM-A10-24342','348088123'],
  ['DSPT12062309727','Shortage Invoice Re-Dispute','10/16/25','Approved',125.98,125.98,'PTM-A03-23920','348088123'],
  ['DSPT10552360287','Shortage Invoice Re-Dispute','10/16/25','Approved',125.98,125.98,'PTM-A03-23780','348088123'],
  ['DSPT10753686879','Shortage Invoice Re-Dispute','10/16/25','Approved',582.12,582.12,'PTM-A05-23885','348088123'],
  ['DSPT10401365343','Shortage Invoice Re-Dispute','10/16/25','Approved',10.48,10.48,'PTM-A07-23466','348088123'],
  ['DSPT10686578015','Shortage Invoice Re-Dispute','10/16/25','Approved',227.88,227.88,'PTM-A05-23478','348088123'],
  ['DSPT11072453983','Shortage Invoice Re-Dispute','10/16/25','Approved',1187.60,1187.60,'PTM-A03-22883','348088123'],
  ['DSPT11089231199','Shortage Invoice Re-Dispute','10/16/25','Approved',118.56,118.56,'PTM-A10-20760','348088123']]},
 Denied:{n:214,rows:[['DSPT10994172831','Shortage Invoice Re-Dispute','10/16/25','Denied',412.90,0,'PTM-A02-26114','348088123'],
  ['DSPT11338092447','Shortage Invoice Re-Dispute','10/16/25','Denied',88.14,0,'CPM-25903','348088123'],
  ['DSPT10477218655','Shortage Invoice Re-Dispute','10/16/25','Denied',1504.22,0,'PTM-A04-25488','348088123'],
  ['DSPT11760334079','Shortage Invoice Re-Dispute','10/16/25','Denied',236.75,0,'PTM-A06-24901','348088123'],
  ['DSPT10118467295','Shortage Invoice Re-Dispute','10/16/25','Denied',67.30,0,'CPM-24118','348088123']]},
 Pending:{n:18,rows:[['DSPT11905338271','Shortage Invoice','10/16/25','Pending Amazon Action',844.09,0,'PTM-A09-26880','348088123'],
  ['DSPT10663271903','Shortage Invoice','10/16/25','Pending Amazon Action',301.44,0,'CPM-26712','348088123'],
  ['DSPT11471096543','Shortage Invoice','10/16/25','Pending Amazon Action',159.88,0,'PTM-A11-26355','348088123']]}
};
BULK.All = {n:362,rows:BULK.Approved.rows.slice(0,5).concat(BULK.Denied.rows.slice(0,3)).concat(BULK.Pending.rows.slice(0,2))};

var PRICE = {Approved:{n:8,rows:[['DSPT11098960223','Price claim','08/05/26','Approved',34.00,34.00],
 ['DSPT10502817887','Price claim','07/24/26','Approved',33.20,33.20],['DSPT10504945247','Price claim','06/02/26','Approved',32.03,32.03],
 ['DSPT11529406303','Price claim','04/26/26','Approved',77.80,77.80],['DSPT10294960991','Price claim','02/04/26','Approved',67.99,67.99],
 ['DSPT11897183071','Price claim','01/28/26','Approved',31.48,31.48],['DSPT10136614239','Price claim','01/02/26','Approved',27.84,27.84],
 ['DSPT10901550687','Price claim','11/18/25','Approved',37.72,37.72]]},
 Denied:{n:3,rows:[['DSPT11440227359','Price claim','07/02/26','Denied',58.44,0],['DSPT10817705183','Price claim','05/14/26','Denied',22.90,0],
 ['DSPT12011683807','Price claim','03/19/26','Denied',41.16,0]]},
 Pending:{n:2,rows:[['DSPT11256930911','Price claim','09/22/26','Pending Amazon Action',96.35,0],['DSPT10739481247','Price claim','09/08/26','Pending Amazon Action',48.72,0]]}};
PRICE.All = {n:13,rows:PRICE.Approved.rows.slice(0,5).concat(PRICE.Denied.rows).concat(PRICE.Pending.rows)};

var INF_SPLIT = [['PO on-time accuracy',0,0,0,0,0],['In Full Delivery',3152.61,135.43,135.43,0,0],['Receiving Accuracy',448.01,151.89,151.89,0,0]];
var INF_QTR = [['In Full Delivery',5945.23,23917.24,33376.33,0],['PO on-time accuracy',0,0,0,0],['Receiving Accuracy',2095.17,4454.72,1162.04,0],['On-time shipment',6745.07,35643.59,16119.63,4631.25]];
var ASIN = [['B0C4KN2QLD','In Full Delivery','Shortage at receipt',412,2184.60,2184.60,2184.60,'Approved'],
 ['B0C4KN3MXP','On-time shipment','Late carrier pickup',188,1340.22,1340.22,0,'Pending Amazon Action'],
 ['B0C4KN4TRV','Receiving Accuracy','Carton count variance',96,448.01,151.89,151.89,'Approved'],
 ['B0C4KN5WQJ','In Full Delivery','Shortage at receipt',240,968.01,135.43,135.43,'Approved'],
 ['B0C4KN6ZHB','On-time shipment','Missed delivery window',74,612.40,612.40,0,'Denied']];
var COOP_SUB = [['Shipment Disparity',9270.68,1463.44,7807.24],['Duplicate Freight',0,0,0],['Non-compliant Freight',0,0,0],['Duplicate Billing',0,0,0],['Non Compliant Fee',0,0,0]];
var JOBS = [['10/03/26','Shortage Reconciliation'],['09/29/26','Shortage Reconciliation'],['09/21/26','Shortage Reconciliation'],['09/16/26','Shortage Reconciliation'],['09/03/26','Shortage Reconciliation'],['08/14/26','Duplicate Freight'],['08/14/26','Shipment Disparity'],['08/14/26','Non-compliant Freight'],['08/11/26','Shortage Reconciliation'],['08/03/26','Shortage Reconciliation']];
var BDOWN0 = [
 [1,766826.01,'01/05/2024 - 12/22/2025','TS00000017_1773064781715','03/09/26','05/07/26',[70008.61,51],[5658.60,21],106031.25,'CREATING DISPUTES',true],
 [2,166116.28,'01/12/2026 - 05/29/2026','TS00000017_1783588475223','07/09/26','07/16/26',[127557.87,191],[5969.39,7],32589.02,'All DONE',true],
 [3,113978.90,'06/01/2026 - 07/10/2026','TS00000017_1787117690029','08/19/26','-',[0,0],[0,0],0,'FETCHING INVOICES DETAILS',false]];
var YOY = [['2026',-28049.86],['2025',425897.41],['2024',-390033.96],['2023',-6.35]];
var COOPD0 = [['DSPT11391985759',296823.98,0,'Demo User 1','07/24/26','-','Shipment Disparity','-','Resolved']];
var RESULT = [['80211255',270301.60,3855.29,13498.88,9643.59,'0.00%',0,0],['76407815',9865.36,0,0,0,'0.00%',0,0],
 ['98218195',70036.11,202.61,418.85,216.23,'0.00%',0,0],['77094245',50422.72,197.99,42.67,155.32,'0.00%',161.67,0],
 ['69950885',303523.73,6433.45,57383.07,50949.62,'0.00%',0,0],['106093875',213.40,1.20,0,1.20,'0.00%',0,0],
 ['75790860',1330594.73,25733.78,229532.26,203798.48,'0.00%',0,0],['83322490',448791.37,119583.01,44882.07,74700.93,'0.00%',0,0],
 ['80211055',1180275.50,15908.84,53859.23,37950.40,'0.00%',0,0],['83322470',2141826.23,478779.64,181592.17,297187.47,'62.00%',0,0],
 ['99282580',5097.58,44.37,13639.72,13595.35,'0.00%',0,0],['98218150',18570.01,71.75,0,71.75,'0.00%',0,0],
 ['105651085',5311.57,22.30,4.83,17.47,'0.00%',0,0],['88450250',355944.68,70398.15,16244.65,54153.50,'0.00%',0,0],
 ['106092975',109488.35,502.26,467.17,35.08,'0.00%',0,0]];
var SPARK = [4100,5200,4600,6800,5400,7900,6200,8800,7100,9270,8400,7807];
var EB = {2026:[62,88,71,104,96,131,118,152,141,166,0,0],2025:[210,186,241,198,266,221,284,239,301,262,318,274],2024:[344,298,361,312,389,330,402,348,418,366,441,380]};

var DISPUTES = [['Demo Account 1','DSPT11391985759',296823.98,0,'0.0%','Demo User 1','07/24/26','-','Shipment Disparity','-','RESOLVED'],
 ['Demo Account 2','DSPT11660154975',726.93,726.93,'100.0%','Demo User 1','09/09/26','09/14/26','Shipment Disparity','5','Resolved'],
 ['Demo Account 3','DSPT11152636255',589.19,0,'0.0%','Demo User 1','08/11/26','08/17/26','Duplicate Freight','6','Resolved'],
 ['Demo Account 4','DSPT11565384543',671.69,0,'0.0%','Demo User 2','08/11/26','08/12/26','Shipment Disparity','1','Resolved'],
 ['Demo Account 5','DSPT11018379615',620.14,620.14,'100.0%','Demo User 2','08/10/26','08/14/26','Shipment Disparity','4','Resolved'],
 ['Demo Account 6','DSPT11421073759',674.20,674.20,'100.0%','Demo User 1','08/10/26','08/14/26','Non Compliant Fee','4','Resolved'],
 ['Demo Account 7','DSPT11238270047',412.14,412.14,'100.0%','Demo User 2','08/03/26','08/07/26','Shipment Disparity','4','Resolved'],
 ['Demo Account 8','DSPT11036918879',629.22,0,'0.0%','Demo User 1','08/03/26','08/05/26','Duplicate Billing','2','Resolved'],
 ['Demo Account 9','DSPT11295210079',679.88,679.88,'100.0%','Demo User 2','08/03/26','08/07/26','Shipment Disparity','4','Resolved'],
 ['Demo Account 10','DSPT11389240415',644.25,504.21,'78.26%','Demo User 1','08/03/26','08/06/26','Shipment Disparity','3','Resolved'],
 ['Demo Account 11','DSPT11469779039',869.78,0,'0.0%','Demo User 2','07/31/26','-','Shipment Disparity','-','RESOLVED'],
 ['Demo Account 2','DSPT11268445279',1274.24,0,'0.0%','Demo User 1','07/30/26','-','Shipment Disparity','-','RESOLVED']];

var CUST = [[1,'US','Demo Account 1','Demo Account 1','vcbot@tradeplace.com','03/27/25','12.5%','Net 30','-','-','No','1.84%',7807.24,296823.98,'3801.91%',7807.24,0,1463.44,296823.98],
 [2,'US','Demo Account 2','Demo Account 2','vcbot@tradeplace.com','04/02/25','15.0%','Net 30','Partner','20%','Yes','2.43%',5659.78,6656.00,'117.6%',5659.78,6111.55,0,248.64],
 [3,'US','Demo Account 3','Demo Account 3','vcbot@tradeplace.com','04/02/25','15.0%','Net 30','Partner','20%','Yes','1.71%',7768.95,9976.86,'128.42%',7768.95,9913.52,0,167.91],
 [4,'US','Demo Account 4','Demo Account 4','vcbot@tradeplace.com','05/18/25','12.5%','Net 45','-','-','Yes','1.07%',3142.84,6745.77,'214.64%',3142.84,4667.78,0,2158.73],
 [5,'US','Demo Account 5','Demo Account 5','vcbot@tradeplace.com','06/09/25','12.5%','Net 30','-','-','Yes','0.95%',15219.96,15665.48,'100.92%',15219.96,1463.55,0,13502.08],
 [6,'US','Demo Account 6','Demo Account 6','vcbot@tradeplace.com','07/14/25','15.0%','Net 30','Partner','20%','Yes','1.32%',3264.31,8636.63,'264.58%',3264.31,1546.01,0,7090.62],
 [7,'US','Demo Account 7','Demo Account 7','vcbot@tradeplace.com','08/01/25','12.5%','Net 30','-','-','Yes','1.03%',989.45,1401.15,'141.61%',989.45,599.29,0,801.85],
 [8,'US','Demo Account 8','Demo Account 8','vcbot@tradeplace.com','09/22/25','12.5%','Net 45','-','-','No','-','-','-','-','-','-','-','-']];

var ONB = {
 'Onboarded In Last 30 Days':[['Demo Account 8','Demo Account 8','VC-0008','09/22/25','Yes','Completed'],
   ['Demo Account 7','Demo Account 7','VC-0007','09/30/25','Yes','Completed']],
 'Job Submitted In Last 90 Days':[['Demo Account 1','Demo Account 1','VC-0001','08/03/26','Yes','Shortage Reconciliation'],
   ['Demo Account 2','Demo Account 2','VC-0002','08/14/26','Yes','Shipment Disparity'],
   ['Demo Account 5','Demo Account 5','VC-0005','09/16/26','Yes','Duplicate Freight']],
 'Contract Details Not Updated':[['Demo Account 1','Demo Account 1','VC-0001','03/27/25','No','Pending Amazon Action'],
   ['Demo Account 8','Demo Account 8','VC-0008','09/22/25','No','Pending Amazon Action']],
 'Contract Details Updated':[['Demo Account 2','Demo Account 2','VC-0002','04/02/25','Yes','Completed'],
   ['Demo Account 3','Demo Account 3','VC-0003','04/02/25','Yes','Completed'],
   ['Demo Account 4','Demo Account 4','VC-0004','05/18/25','Yes','Completed'],
   ['Demo Account 6','Demo Account 6','VC-0006','07/14/25','Yes','Completed']]
};

var DLMGR = [[1,'Demo Account 1','On Going Shortage','Approved Disputes','10/13/26 09:12','Completed'],
 [2,'Demo Account 1','Excess Coop Billing','Granular Analysis','10/13/26 08:55','Completed'],
 [3,'Demo Account 1','Missed Invoicing','Progress Tracker','10/13/26 08:51','In Progress'],
 [4,'Demo Account 1','P&L Analysis','Yearly Comparison','10/12/26 18:30','Completed'],
 [5,'Demo Account 2','Ops Chargeback','ASIN Level Split','10/12/26 14:02','Completed'],
 [6,'Demo Account 3','Price Claim','Approved Disputes','10/12/26 11:47','Failed']];

var CLIENTS = [[1,'US','Demo Account 1','VC-0001','Yes','Yes','Yes','Yes'],
 [2,'US','Demo Account 2','VC-0002','Yes','Yes','Yes','No'],
 [3,'US','Demo Account 3','VC-0003','Yes','No','Yes','Yes'],
 [4,'US','Demo Account 4','VC-0004','Yes','Yes','No','No'],
 [5,'US','Demo Account 5','VC-0005','No','Yes','Yes','No'],
 [6,'US','Demo Account 6','VC-0006','Yes','No','No','No'],
 [7,'US','Demo Account 8','VC-0008','No','No','No','No']];
var USERS = [['demo.admin@tradeplace.com','Administrator','All','All (7)','Today, 09:14','Active'],
 ['demo.ops@tradeplace.com','Operations Lead','All','All (7)','Today, 08:40','Active'],
 ['demo.analyst@tradeplace.com','Analyst','Demo Account 1','3 assigned','Yesterday, 17:22','Active'],
 ['finance@demoaccount1.example','Client (external)','Demo Account 1','Own only','2 days ago','Active'],
 ['demo.audit@tradeplace.com','Read only','Demo Account 1','1 assigned','18 days ago','Expired']];
var GROUPS = [['Finance — full',4,'All (11)','All (7)','01/12/26','Active'],['Analyst — US',3,'8 of 11','3 assigned','02/04/26','Active'],
 ['Client read-only',6,'4 of 11','Own only','01/12/26','Active'],['External audit',1,'2 of 11','1 assigned','09/25/26','Time-limited']];

/* ---------- navigation ---------- */
var PAGES = [
 {id:'dashboard',t:'Dashboard',i:'grid'},{id:'ongoing',t:'On Going Shortage',i:'wave'},
 {id:'bulk',t:'Bulk Period Shortage',i:'clock'},{id:'price',t:'Price Claim',i:'receipt'},
 {id:'ops',t:'Ops Chargeback',i:'gear'},{id:'missed',t:'Missed Invoicing',i:'file'},
 {id:'coop',t:'Excess Coop Billing',i:'chart'},{id:'pnl',t:'P&L Analysis',i:'graph'},
 {id:'links',t:'Internal Links',i:'link',kids:[
   {id:'dispute',t:'Manage Disputes',i:'doc'},{id:'onboard',t:'Onboard Tracker',i:'track'},{id:'customer',t:'Customer Dashboard',i:'grid'}]},
 {id:'downloads',t:'Download Manager',i:'down'},{id:'access',t:'Manage Access',i:'users'}];
var TITLE = {dashboard:'Dashboard',ongoing:'On Going Shortage Claim Dispute',bulk:'Bulk Period Shortage',price:'Price Claim',
 ops:'Operational Chargeback',missed:'Missed Invoicing',coop:'Excess Coop Billing',pnl:'P&L Analysis',
 dispute:'Manage Dispute',onboard:'Manage Onboard Tracker',customer:'Customer Dashboard',
 coopd:'Manage Dispute',result:'Result Summary',downloads:'Download Manager',access:'Manage Clients'};
/* Breadcrumb trail per page: [label, pageId or null when it's the current page].
   "Excess Coop Biiling" is production's spelling — kept deliberately. */
var CRUMB = {
 dashboard:[],
 ongoing:[['On Going Shortage', null]],
 bulk:[['Bulk Period Shortage', null]],
 price:[['Price Claim', null]],
 ops:[['Operational Chargeback', null]],
 missed:[['Missed Invoicing', null]],
 coop:[['Excess Coop Billing', null]],
 pnl:[['P&L Analysis', null]],
 dispute:[['Manage Dispute', null]],
 onboard:[['Manage Onboard Tracker', null]],
 customer:[['Customer Dashboard', null]],
 downloads:[['Download Manager', null]],
 access:[['Manage Clients', null]],
 coopd:[['Excess Coop Biiling', 'coop'], ['Manage Dispute', null]],
 result:[['Excess Coop Biiling', 'coop'], ['Result Summary', null]]
};

var NOTIF = [
 {u:1, c:'var(--good)', t:'Shortage batch completed',
  m:'Batch TS00000017_1783588475223 finished — 191 new disputes created.', g:'bulk', w:'12 min ago'},
 {u:1, c:'var(--amber)', t:'29 disputes pending with Amazon',
  m:'No response in over 14 days on $14,761.75 of itemized shortage claims.', g:'ongoing', w:'1 hr ago'},
 {u:1, c:'var(--accent)', t:'Export ready',
  m:'OnGoing_Shortage_Aug2026.xlsx is available in Download Manager.', g:'downloads', w:'3 hrs ago'},
 {u:0, c:'var(--crit)', t:'Coop agreement overbilled',
  m:'Agreement 83322470 shows $478,779.64 overbilled — 62.00% disputed.', g:'result', w:'Yesterday'},
 {u:0, c:'var(--ink-3)', t:'Contract expiring in 60 days',
  m:'Demo Account 8 contract renewal is due. Review in Customer Dashboard.', g:'customer', w:'2 days ago'}
];
var NAVFOR = {coopd:'coop',result:'coop'};

var FILT = {ongoing:'Approved',bulk:'Approved',price:'Approved',dispute:'Resolved',
 onboard:'Onboarded In Last 30 Days',coopsub:'Shipment Disparity',access:'Clients',opsmode:'Infraction ($)'};
var NAVOPEN = true, FOPEN = {};
/* runtime copies so Delete removes a row for the session and a refresh restores it */
var LIVE = {bdown:BDOWN0.slice(), jobs:JOBS.slice(), coopd:COOPD0.slice()};

/* =========================================================================
   LAYOUT HELPERS — the structural difference from the portal lives here
   ========================================================================= */
function strip(items) {
  return '<div class="strip">' + items.map(function (it) {
    return '<div><div class="k">' + (it.dot ? '<span class="dotm" style="background:' + it.dot + '"></span>' : '') + esc(it.k) + '</div>' +
      '<div class="v ' + (it.c || '') + '">' + it.v + '</div>' +
      (it.s ? '<div class="s">' + it.s + '</div>' : '') + '</div>';
  }).join('') + '</div>';
}
function panel(title, right, body, sub) {
  return '<section class="panel">' +
    (title === null ? '' : '<div class="ph"><h2>' + esc(title) + '</h2>' + (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') +
      '<div class="spacer"></div>' + (right || '') + '</div>') + body + '</section>';
}
function seg(key, items) {
  return '<div class="seg" data-seg="' + key + '" role="tablist">' + items.map(function (x) {
    var v = (x instanceof Array) ? x[0] : x, n = (x instanceof Array) ? x[1] : null;
    return '<button role="tab" data-v="' + esc(v) + '" aria-selected="' + (FILT[key] === v) + '">' + esc(v) +
      (n != null ? '<span class="n">' + N(n) + '</span>' : '') + '</button>';
  }).join('') + '</div>';
}
function ftoggle(key) {
  return '<button class="ftoggle" data-ft="' + key + '" aria-expanded="' + (!!FOPEN[key]) + '">' +
    '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6.4 12h3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Filters</button>';
}
function fpanel(key, flds, actions) {
  return '<div class="fpanel" data-fp="' + key + '"' + (FOPEN[key] ? '' : ' hidden') + '>' + flds.map(function (f) {
    var ctl = f.o ? '<select>' + f.o.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>'
                  : '<input type="text" placeholder="' + esc(f.p || '') + '">';
    return '<div class="fld"><label>' + esc(f.l) + '</label>' + ctl + '</div>';
  }).join('') + (actions ? '<div class="fact">' + actions + '</div>' : '') + '</div>';
}
function th(cols, right, totals) {
  return '<tr>' + cols.map(function (c, i) {
    var tt = totals && totals[i] ? '<span class="tt">(' + totals[i] + ')</span>' : '';
    return '<th' + ((right || []).indexOf(i) > -1 ? ' class="num"' : '') + '>' + esc(c) + tt + '</th>';
  }).join('') + '</tr>';
}
function pill(s) {
  var c = /^approved$/i.test(s) || /^resolved$/i.test(s) || /completed|^paid$|^active$|^ready$/i.test(s) ? 'ok'
        : /denied|overdue|failed|expired/i.test(s) ? 'bad'
        : /not yet|upcoming/i.test(s) ? 'up'
        : /pending|creating|progress|fetching|building|onboarding|time-limited/i.test(s) ? 'wait' : 'neu';
  return '<span class="pill ' + c + '">' + esc(s) + '</span>';
}
function tf(from, to, total, rp) {
  rp = rp || ['10', '15', '20', '25', '30'];
  return '<div class="tf"><span>Rows per page</span><select class="sel" style="padding:3px 22px 3px 8px" aria-label="Rows per page">' +
    rp.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>' +
    '<span class="spacer"></span><span>' + from + '–' + to + ' of ' + N(total) + '</span>' +
    '<span class="pg"><button aria-label="First">⏮</button><button aria-label="Previous">‹</button><button aria-label="Next">›</button><button aria-label="Last">⏭</button></span></div>';
}
function tw(inner, cls) { return '<div class="tw"><table' + (cls ? ' class="' + cls + '"' : '') + '>' + inner + '</table></div>'; }
function meter(p) { return '<div class="meter"><span class="l">Win Rate</span><div class="mt"><div class="mf" style="width:' + p + '%"></div></div><span class="mv">' + p + '%</span></div>'; }
function kvs(rows) {
  return rows.map(function (r) {
    var neg = typeof r[1] === 'string' && r[1].charAt(0) === '-';
    return '<div class="kv"><span' + (r[2] === 'amber' ? ' style="color:var(--amber)"' : '') + '>' + (r[3] ? r[0] : esc(r[0])) + '</span>' +
      '<b' + (neg ? ' class="neg"' : '') + '>' + esc(r[1]) + '</b></div>';
  }).join('');
}
function metrics(items) {
  return items.map(function (it) {
    return '<div class="metric">' + mico(MI[it[2]]) + '<span class="t">' + esc(it[0]) + '</span><span class="n">' + esc(it[1]) + '</span></div>';
  }).join('');
}
function actions(set, i, kind, tip) {
  var mid = kind === 'edit'
    ? '<button title="Edit" aria-label="Edit">' + A_EDIT + '</button>'
    : '<button class="info" title="' + esc(tip || '') + '" aria-label="Info">' + A_INFO + '</button><button title="Download" aria-label="Download">' + A_DL + '</button>';
  return '<td><div class="act">' + mid +
    '<button class="del" title="Delete" aria-label="Delete" data-del="' + set + '" data-i="' + i + '">' + A_DEL + '</button></div></td>';
}
function empty(msg) {
  return '<div class="empty"><svg width="44" height="36" viewBox="0 0 46 38" fill="none"><rect x="2" y="5" width="34" height="26" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="33" cy="28" r="7" stroke="currentColor" stroke-width="2" fill="var(--surface)"/><path d="m38 33 5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><div>' + esc(msg) + '</div></div>';
}
function work(mainHtml, sideHtml) { return '<div class="work"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">' + mainHtml + '</div><aside class="side">' + sideHtml + '</aside></div>'; }
var BIMP = '<button class="btn">Import</button>', BEXP = '<button class="btn s">Export</button>';

/* ---------- charts ---------- */
function spark(el, v) {
  if (!el) return;
  var W = 250, H = 46, mx = Math.max.apply(null, v), mn = Math.min.apply(null, v), r = (mx - mn) || 1;
  var d = v.map(function (p, i) { return (i ? 'L' : 'M') + (6 + (W - 12) * i / (v.length - 1)).toFixed(1) + ' ' + (H - 5 - (H - 12) * (p - mn) / r).toFixed(1); }).join(' ');
  el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Finding amount trend"><path d="' + d + '" fill="none" stroke="var(--accent-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function multi(el, series, labels, title) {
  if (!el) return;
  var W = 600, H = 190, PL = 48, PR = 38, PT = 10, PB = 24, keys = Object.keys(series), all = [];
  keys.forEach(function (k) { all = all.concat(series[k]); });
  var mx = Math.max.apply(null, all) * 1.12, iw = W - PL - PR, ih = H - PT - PB;
  var col = {'2026':'var(--accent)','2025':'var(--accent-3)','2024':'var(--accent-2)'};
  var x = function (i) { return PL + iw * i / (labels.length - 1); }, y = function (v) { return PT + ih - ih * v / mx; };
  var g = '', yl = '';
  for (var t = 0; t <= 4; t++) {
    var gv = mx * t / 4, gy = y(gv);
    g += '<line x1="' + PL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + gy.toFixed(1) + '" stroke="var(--line-2)"/>';
    yl += '<text x="' + (PL - 7) + '" y="' + (gy + 3.5).toFixed(1) + '" text-anchor="end" font-size="9.5" fill="var(--ink-3)">' + Math.round(gv) + 'k</text>';
  }
  var xl = labels.map(function (l, i) { return '<text x="' + x(i).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle" font-size="9.5" fill="var(--ink-3)">' + l + '</text>'; }).join('');
  var p = '', e = '';
  keys.forEach(function (k) {
    var v = series[k], pts = [];
    v.forEach(function (q, i) { if (q > 0) pts.push((pts.length ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(q).toFixed(1)); });
    p += '<path d="' + pts.join(' ') + '" fill="none" stroke="' + col[k] + '" stroke-width="2" stroke-linejoin="round"/>';
    var li = 0; v.forEach(function (q, i) { if (q > 0) li = i; });
    e += '<text x="' + (W - PR + 5) + '" y="' + (y(v[li]) + 3.5).toFixed(1) + '" font-size="9.5" fill="' + col[k] + '" font-weight="600">' + k + '</text>';
  });
  el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(title) + '">' + g + yl + xl + p + e + '</svg>';
}
function bars(el, rows, fmt) {
  if (!el) return;
  var mx = Math.max.apply(null, rows.map(function (r) { return r[1]; })) || 1;
  el.innerHTML = '<div class="bars">' + rows.map(function (r) {
    return '<div class="brow"><div class="l" title="' + esc(r[0]) + '">' + esc(r[0]) + '</div><div class="bt"><div class="bf" style="width:' + (r[1] / mx * 100).toFixed(1) + '%"></div></div><div class="bv">' + (fmt ? fmt(r[1]) : D(r[1])) + '</div></div>';
  }).join('') + '</div>';
}
function donut(el, p, sub) {
  if (!el) return;
  var R = 44, C = 2 * Math.PI * R;
  el.innerHTML = '<svg viewBox="0 0 120 120" role="img" aria-label="' + esc(sub + ' ' + p + ' percent') + '" style="max-width:148px;margin:0 auto">' +
    '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="var(--line-2)" stroke-width="13"/>' +
    '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="var(--accent)" stroke-width="13" stroke-linecap="round" stroke-dasharray="' + (C * p / 100).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
    '<text x="60" y="58" text-anchor="middle" font-size="21" font-weight="600" fill="var(--ink)">' + p + '%</text>' +
    '<text x="60" y="75" text-anchor="middle" font-size="9.5" fill="var(--ink-3)">' + esc(sub) + '</text></svg>';
}

/* =========================================================================
   PAGES
   ========================================================================= */
function pDashboard() {
  return strip([
    {k:'Shortage Findings', v:D(2206208.70), s:'Win rate 25.75%'},
    {k:'Approved Amount', v:D(356315.60), c:'g', s:'Across 11 modules'},
    {k:'Total Pending', v:D(43549.35), c:'a', s:'Awaiting Amazon'},
    {k:'EBITDA %', v:'8.77%', s:'Jan – Jun 2026'},
    {k:'Hours Saved', v:'14,990', s:'367 FTE / week'}
  ]) +
  work(
    panel('Updates', '', '<div class="pb"><div class="upd">' +
      '<div><b>Shortage Claim :</b>This module displays historical bulk shortage data. Earlier this year, Amazon revised its shortage dispute process.</div>' +
      '<div><b>Itemized Shortage Claims :</b>This module reflects shortage cases raised using Amazon’s new invoice-level dispute process.</div>' +
      '<div><b>Itemized Shortage Claim Process :</b>With Amazon’s latest update, each invoice must be disputed separately. Expect a higher volume of shortage cases in your account as a result.</div>' +
      '<div><b>Need Help?</b>Our team is here to support you. For any questions, reach out directly to your Account Manager.</div>' +
      '</div></div>') +
    '<div class="grid2">' +
      panel('Shortage Claim', '<button class="btn" data-go="ongoing">Open ›</button>', '<div class="pb">' + kvs([
        ['Findings', D(2206208.70)], ['Dispute Amount', D(1383851.58)], ['Approved Amount', D(356315.60)],
        ['Out Of Scope', D(138620.27)], ['Total Pending', D(43549.35)], ['Win Rate', '25.75%']]) + '</div>') +
      panel('Price Claim', '<button class="btn" data-go="price">Open ›</button>', '<div class="pb"><div class="chart" id="dP"></div>' +
        kvs([['Disputed', D(342.06)], ['Approved', D(342.06)], ['Pending', D(0)], ['Approved Rate', '100.00%']]) + '</div>') +
      panel('Operational Chargeback', '<button class="btn" data-go="ops">Open ›</button>', '<div class="pb">' + kvs([
        ['In Full Delivery', D(63238.80), 'amber'], ['On-time shipment', D(63139.54), 'amber'],
        ['Receiving Accuracy', D(7711.93), 'amber'], ['Disputed', D(4424.54)], ['Approved', D(2471.92)],
        ['Denied', D(612.40)], ['Win Rate', '80.14%']]) + '</div>') +
      panel('Missed Invoicing', '<button class="btn" data-go="missed">Open ›</button>', '<div class="pb">' + kvs([
        ['Shipped but not invoiced', D(35579.56)], ['Claim Submitted', D(18204.11)],
        ['Recouped Amount', D(18204.11)], ['Recouped Rate', '51.17%']]) + '</div>') +
      panel('Excess Coop', '<button class="btn" data-go="coop">Open ›</button>', '<div class="pb">' + kvs([
        ['Win Rate', '0.00%'], ['Findings', D(7807.24)], ['Disputed', D(296823.98)], ['Recouped', D(0)],
        ['Yearly 2026', SD(-28049.86)], ['Yearly 2025', D(425897.41)], ['Yearly 2024', SD(-390033.96)]]) + '</div>') +
      panel('P&L Analysis', '<button class="btn" data-go="pnl">Open ›</button>', '<div class="pb">' + kvs([
        ['EBITDA %', '8.77%'], ['EBITDA $', D(442037.98)], ['CoOp', D(1807977.38)], ['AMS', '-'],
        ['Ops Chargeback', D(67370.09)], ['PO Acceptance Rate', '94.2%']]) + '</div>') +
    '</div>',
    /* sticky context column */
    panel('Account', '', '<div class="pb">' +
      '<div style="display:flex;gap:11px;align-items:center;margin-bottom:12px"><div class="avatar" style="width:38px;height:38px;font-size:13px">DU</div>' +
      '<div><div style="font-size:14px;font-weight:600">Welcome, Demo User</div><div style="font-size:11.5px;color:var(--ink-3)">Demo Account 1</div></div></div>' +
      '<div style="font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);font-weight:600;margin-bottom:4px">Total Impact Overview</div>' +
      metrics([['Total Hours Saved', '14,990 Hrs', 'hrs'], ['Total Amount Saved', '$449,700', 'amt'], ['Total FTE Saved/week', "367 FTE's", 'fte']]) + '</div>') +
    '<div class="note"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" style="flex:none;margin-top:1px"><circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v3.8M8 5.2v.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<div><b>Demo build.</b> Figures, dispute IDs, invoice numbers and client names on this site are illustrative.</div></div>'
  );
}

/* ---- On Going Shortage ---- */
function pOngoing() {
  var k = FILT.ongoing, s = OG[k];
  var body = s.rows.map(function (r) {
    return '<tr>' + r.map(function (v, i) {
      if (i === s.st) return '<td>' + pill(v) + '</td>';
      if ((s.money || []).indexOf(i) > -1) return '<td class="num">' + D(v) + '</td>';
      if ((s.plain || []).indexOf(i) > -1) return '<td class="num">' + PN(v) + '</td>';
      if (/Type/.test(s.cols[i])) return '<td class="typ">' + esc(v) + '</td>';
      if (/Dispute ID|Payment Number|^PO$/.test(s.cols[i])) return '<td class="mono">' + mk(v) + '</td>';
      if (/Invoice Number/.test(s.cols[i])) return '<td class="mono">' + esc(v) + '</td>';
      return '<td>' + esc(v) + '</td>';
    }).join('') + '</tr>';
  }).join('');

  return strip([
    {k:'Total Disputed', v:D(1159287.51)},
    {k:'Total Approved', v:D(297773.04), c:'g'},
    {k:'Total Pending', v:D(14761.75), c:'a'},
    {k:'Total Denied', v:D(846752.72), c:'r'}
  ]) +
  panel('FinOps-Shortage Claim', ftoggle('og') + BIMP + BEXP,
    fpanel('og', [
      {l:'Search Dispute ID', p:'Search Dispute ID'}, {l:'Invoice Number', p:'Search Invoice Number'},
      {l:'Dispute Type', o:['All', 'Shortage invoice', 'Shortage Invoice Re-Dispute']},
      {l:'Start Date', p:'mm/dd/yyyy'}, {l:'End Date', p:'mm/dd/yyyy'}
    ], '<button class="btn p">Search</button><button class="btn">Reset</button>') +
    '<div class="pb" style="padding-bottom:0">' + seg('ongoing', [['Approved', 916], ['Denied', 1441], ['Pending with Amazon', 29], ['Upcoming', 582], ['All', 3651]]) + '</div>' +
    tw('<thead>' + th(s.cols, (s.money || []).concat(s.plain || [])) + '</thead><tbody>' + body + '</tbody>') +
    tf(1, s.rows.length, s.n)) +
  panel('Detailed Breakdown', BEXP,
    tw('<thead>' + th(['S.No', 'Dispute ID', 'Total Disputed Amount', 'New Submitted Dispute Id', 'Approved Amount', 'Create Date', 'Dispute Status', 'Dispute Type'], [0, 2, 4]) + '</thead><tbody>' +
      BREAK.map(function (r) {
        return '<tr><td class="num">' + r[0] + '</td><td class="mono">' + mk(r[1]) + '</td><td class="num">' + D(r[2]) + '</td><td class="mono">' + mk(r[3]) + '</td>' +
          '<td class="num">' + (r[4] ? D(r[4]) : '-') + '</td><td>' + esc(r[5]) + '</td><td>' + pill(r[6]) + '</td><td class="typ">' + esc(r[7]) + '</td></tr>';
      }).join('') + '</tbody>') +
    tf(1, 10, 1387, ['10', '30', '45']));
}

/* ---- Bulk Period Shortage ---- */
function pBulk() {
  var k = FILT.bulk, s = BULK[k];
  return strip([
    {k:'New Disputes', v:D(212724.80)}, {k:'Re-Disputes', v:D(11839.27)},
    {k:'Out Of Scope', v:D(138620.27)}, {k:'Total Pending', v:D(28787.60), c:'a'},
    {k:'Win Rate', v:'25.75%', c:'g'}
  ]) +
  work(
    panel('Detailed Breakdown', '<span class="tag">side-scrollable</span>' + BIMP + BEXP,
      tw('<thead>' + th(['S.No', 'Total Findings', 'Invoice Date', 'Batch ID', 'Finding Completion Date', 'Dispute Trigger Date', 'New Dispute', 'Re-Dispute', 'Out Of Scope', 'Process Status', 'Dispute Trigger', 'Action'], [0, 1, 8]) + '</thead><tbody>' +
        LIVE.bdown.map(function (r, i) {
          return '<tr><td class="num">' + r[0] + '</td><td class="num">' + D(r[1]) + '</td><td>' + esc(r[2]) + '</td><td class="mono">' + esc(r[3]) + '</td>' +
            '<td>' + esc(r[4]) + '</td><td>' + esc(r[5]) + '</td>' +
            '<td class="two"><b>Amount : ' + D(r[6][0]) + '</b><span>Dispute count : ' + r[6][1] + '</span></td>' +
            '<td class="two"><b>Amount : ' + D(r[7][0]) + '</b><span>Dispute count : ' + r[7][1] + '</span></td>' +
            '<td class="num">' + D(r[8]) + '</td><td>' + pill(r[9]) + '</td>' +
            '<td><span class="toggle' + (r[10] ? ' on' : '') + '"><i></i></span></td>' + actions('bdown', i, 'job', 'Batch ' + r[3]) + '</tr>';
        }).join('') + '</tbody>') +
      tf(LIVE.bdown.length ? 1 : 0, LIVE.bdown.length, LIVE.bdown.length)) +
    panel(null, '', '<div class="ph">' + seg('bulk', [['Approved', 130], ['Denied', 214], ['Pending', 18], ['All', 362]]) + '<div class="spacer"></div>' + meter(25.75) + BEXP + '</div>' +
      tw('<thead>' + th(['Dispute ID', 'Type', 'Dispute Date', 'Dispute Status', 'Dispute Amount', 'Approved Amount', 'invoice Number', 'Payment Number'], [4, 5]) + '</thead><tbody>' +
        s.rows.map(function (r) {
          return '<tr><td class="mono">' + mk(r[0]) + '</td><td class="typ">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + pill(r[3]) + '</td>' +
            '<td class="num">' + D(r[4]) + '</td><td class="num">' + D(r[5]) + '</td><td class="mono">' + esc(r[6]) + '</td><td class="mono">' + mk(r[7]) + '</td></tr>';
        }).join('') + '</tbody>') +
      tf(1, s.rows.length, s.n)),
    panel('Impact Overview', '', '<div class="pb">' + metrics([['Total Hours', '831 Hrs', 'hrs'], ['Amount Saved', '$24,930', 'amt'], ['FTE Saved/week', "14 FTE's", 'fte'], ['Win Rate', '25.75%', 'win']]) + '</div>') +
    panel('Process Status', '', '<div class="pb">' + kvs([['CREATING DISPUTES', '1'], ['All DONE', '1'], ['FETCHING INVOICES DETAILS', '1']]) + '</div>')
  );
}

/* ---- Price Claim ---- */
function pPrice() {
  var k = FILT.price, s = PRICE[k];
  return strip([
    {k:'Total Disputed', v:D(342.06)}, {k:'Total Approved', v:D(342.06), c:'g'},
    {k:'Total Pending', v:D(145.07), c:'a'}, {k:'Total Denied', v:D(122.50), c:'r'}
  ]) +
  panel('Price Claim', ftoggle('pc') + meter(100) + BIMP + BEXP,
    fpanel('pc', [{l:'Search Dispute ID', p:'Search Dispute ID'}, {l:'Dispute Status', o:['All', 'Approved', 'Denied', 'Pending']},
      {l:'Start Date', p:'mm/dd/yyyy'}, {l:'End Date', p:'mm/dd/yyyy'}], '<button class="btn p">Search</button><button class="btn">Reset</button>') +
    '<div class="pb" style="padding-bottom:0">' + seg('price', [['Approved', 8], ['Denied', 3], ['Pending', 2], ['All', 13]]) + '</div>' +
    tw('<thead>' + th(['Dispute ID', 'Dispute Type', 'Dispute Date', 'Dispute Status', 'Dispute Amount', 'Approved Amount (As Per Vc)'], [4, 5]) + '</thead><tbody>' +
      s.rows.map(function (r) {
        return '<tr><td class="mono">' + mk(r[0]) + '</td><td class="typ">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + pill(r[3]) + '</td>' +
          '<td class="num">' + D(r[4]) + '</td><td class="num">' + D(r[5]) + '</td></tr>';
      }).join('') + '</tbody>') +
    tf(1, s.rows.length, s.n));
}

/* ---- Ops Chargeback ---- */
function pOps() {
  return strip([
    {k:'Total Disputed', v:D(4424.54)}, {k:'Total Approved', v:D(2471.92), c:'g'},
    {k:'Total Pending', v:D(1340.22), c:'a'}, {k:'Total Denied', v:D(612.40), c:'r'},
    {k:'Win Rate', v:'80.14%', c:'g'}
  ]) +
  '<div class="grid2">' +
  panel('Infraction Split', '<select class="sel"><option>January</option><option>February</option></select><select class="sel"><option>2026</option><option>2025</option></select>',
    tw('<thead>' + th(['Infraction/Issue Type', 'Total Deduction', 'Total Disputed', 'Dispute Approved', 'Dispute Denied', 'Pending Disputed Line Items'], [1, 2, 3, 4, 5]) + '</thead><tbody>' +
      INF_SPLIT.map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + D(r[1]) + '</td><td class="num">' + D(r[2]) + '</td><td class="num">' + D(r[3]) + '</td><td class="num">' + D(r[4]) + '</td><td class="num">' + r[5] + '</td></tr>';
      }).join('') + '</tbody>')) +
  panel('Infraction Type', '<select class="sel"><option>2026</option><option>2025</option></select>',
    tw('<thead>' + th(['Infraction/Issue Type', 'QTR 1', 'QTR 2', 'QTR 3', 'QTR 4'], [1, 2, 3, 4]) + '</thead><tbody>' +
      INF_QTR.map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + D(r[1]) + '</td><td class="num">' + D(r[2]) + '</td><td class="num">' + D(r[3]) + '</td><td class="num">' + D(r[4]) + '</td></tr>';
      }).join('') + '</tbody>')) +
  '</div>' +
  panel('Operational Chargebacks - ASIN Level Split',
    ftoggle('ops') + seg('opsmode', ['Infraction ($)', 'Infraction (Units)']) + BEXP,
    fpanel('ops', [{l:'Year', o:['2026', '2025']}, {l:'Month', o:['January', 'February', 'March']},
      {l:'Status', o:['Select Status', 'Approved', 'Denied', 'Pending Amazon Action']},
      {l:'Issue Type', o:['Select Issue Type', 'In Full Delivery', 'On-time shipment', 'Receiving Accuracy']},
      {l:'SubIssue Type', o:['Select SubIssue Type', 'Shortage at receipt', 'Late carrier pickup', 'Carton count variance']}],
      '<button class="btn p">Search</button><button class="btn">Reset</button>') +
    tw('<thead>' + th(['ASIN', 'Issue Type', 'SubIssue Type', 'Units', FILT.opsmode, 'Disputed', 'Recovered', 'Status'], [3, 4, 5, 6]) + '</thead><tbody>' +
      ASIN.map(function (r) {
        var unit = FILT.opsmode === 'Infraction (Units)';
        return '<tr><td class="mono">' + mk(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td class="num">' + N(r[3]) + '</td>' +
          '<td class="num">' + (unit ? N(r[3]) : D(r[4])) + '</td><td class="num">' + D(r[5]) + '</td><td class="num">' + D(r[6]) + '</td><td>' + pill(r[7]) + '</td></tr>';
      }).join('') + '</tbody>') +
    tf(1, 5, 5));
}

/* ---- Missed Invoicing ---- */
function pMissed() {
  return strip([
    {k:'Shipped but not invoiced', v:D(35579.56)}, {k:'Claim Submitted', v:D(18204.11)},
    {k:'Recouped Amount', v:D(18204.11), c:'g'}, {k:'Recouped Rate', v:'51.17%'}
  ]) +
  panel('Missed Invoicing',
    '<button class="btn p">Run Request</button><button class="btn" data-modal="upload">Findings Upload Logs</button><button class="btn s" data-track="1">Progress Tracker ›</button>',
    tw('<thead>' + th(['Batch Number', 'PO Period', 'Finding (Import / Export)', 'Finding Amount', 'Invoice Trigger', 'Invoice Creation Date', 'Invoiced Amount', 'Payment (Import/Export)', 'Payment Date', 'Payment Number', 'Payment Received', 'Recovery Rate', 'Expected Payment Due Date', 'Status'], [3, 6, 10, 11]) + '</thead><tbody>' +
      '<tr><td class="mono">TS00000017_04425</td><td>04/01/2025 - 12/31/2025</td><td style="text-align:center">' + A_DL + '</td><td class="num">' + D(35579.56) + '</td>' +
      '<td><span class="toggle"><i></i></span></td><td>-</td><td class="num">-</td><td>-</td><td>-</td><td class="mono">-</td><td class="num">-</td><td class="num">-</td><td>-</td><td>' + pill('Creating Invoice') + '</td></tr>' +
      '<tr><td class="mono">TS00000016_04318</td><td>01/01/2025 - 03/31/2025</td><td style="text-align:center">' + A_DL + '</td><td class="num">' + D(18204.11) + '</td>' +
      '<td><span class="toggle on"><i></i></span></td><td>08/19/26</td><td class="num">' + D(18204.11) + '</td><td style="text-align:center">' + A_DL + '</td><td>09/30/26</td><td class="mono">3681***027</td><td class="num">' + D(18204.11) + '</td><td class="num">100.00%</td><td>09/28/26</td><td>' + pill('Paid') + '</td></tr>' +
      '<tr><td class="mono">TS00000015_04201</td><td>10/01/2024 - 12/31/2024</td><td style="text-align:center">' + A_DL + '</td><td class="num">' + D(42870.33) + '</td>' +
      '<td><span class="toggle on"><i></i></span></td><td>06/04/26</td><td class="num">' + D(42870.33) + '</td><td style="text-align:center">' + A_DL + '</td><td>-</td><td class="mono">-</td><td class="num">' + D(0) + '</td><td class="num">0.00%</td><td>07/19/26</td><td>' + pill('Overdue') + '</td></tr>' +
      '</tbody>') +
    tf(1, 3, 3));
}

/* ---- Excess Coop Billing ---- */
function pCoop() {
  return strip([
    {k:'Finding Amount', v:D(7807.24), s:'Shipment Disparity, net of adjustments'},
    {k:'Yearly Trends', v:SD(-28049.86), c:'r', s:'2026 · <span class="xl" data-modal="yoy">View Details ›</span>'},
    {k:'Disputed Amount', v:D(296823.98), s:'<span class="xl" data-go="coopd">View Details ›</span>'},
    {k:'Recouped Amount', v:D(0), s:'Export Remittance available'}
  ]) +
  work(
    '<div class="grid2">' +
    panel('Finding Amount', '<button class="btn" data-modal="yoy">YOY Split</button>', '<div class="pb"><div class="chart" id="cS"></div>' +
      kvs([['2026', SD(-28049.86)], ['2025', D(425897.41)], ['2024', SD(-390033.96)], ['2023', SD(-6.35)]]) + '</div>') +
    panel('Recouped Amount', '<button class="btn">Export Remittance ' + A_DL + '</button>', '<div class="pb">' +
      '<div style="font-family:var(--m);font-size:24px;font-weight:600">' + D(0) + '</div>' +
      '<div style="font-size:11.5px;color:var(--ink-3);margin-top:4px">Nothing remitted in the current window.</div>' +
      kvs([['Disputed Amount', D(296823.98)], ['Prior Adjustment', D(1463.44)], ['Net Off', D(7807.24)]]) + '</div>') +
    '</div>' +
    panel('Granular Analysis', '<button class="btn s">P.A Export</button>',
      tw('<thead>' + th(['Sub-type', 'Findings', 'Prior Adjustments', 'Net Off'], [1, 2, 3]) + '</thead><tbody>' +
        COOP_SUB.map(function (r, i) {
          return '<tr><td' + (i === 0 ? ' style="color:var(--amber)"' : '') + '>' + esc(r[0]) + '</td><td class="num">' + D(r[1]) + '</td><td class="num">' + D(r[2]) + '</td><td class="num">' + D(r[3]) + '</td></tr>';
        }).join('') + '</tbody>')) +
    panel('Efficiency Assessment',
      '<select class="sel" data-req="1"><option>New Request</option><option>Shortage Reconciliation</option><option>Reverse Contribution</option></select>',
      '<div class="pb" style="padding-bottom:0">' + seg('coopsub', ['Shipment Disparity', 'Duplicate Freight', 'Non-Compliant Freight', 'Duplicate Billing', 'Non Compliant Fee']) + '</div>' +
      '<div class="pb"><div style="font-size:11.5px;color:var(--ink-3);margin-bottom:8px">07/01/23 to 07/31/26</div>' +
      kvs([['<span class="xl" data-go="result">Agreements Scanned</span>', '19', null, true], ['CoOp Invoices Scanned', '192'],
        ["PO's Scanned", '147,022'], ['Sum Identified', FILT.coopsub === 'Shipment Disparity' ? D(9270.68) : D(0)]]) +
      '<div style="font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);font-weight:600;margin:14px 0 6px">Win Rate</div><div id="cW"></div></div>') +
    panel('Jobs in Progress', BIMP + BEXP,
      tw('<thead>' + th(['Vendor Name', 'Date', 'Type', 'Agreement Id', 'Stage', 'Pending Task', 'Progress', 'Action']) + '</thead><tbody>' +
        LIVE.jobs.map(function (j, i) {
          return '<tr><td>Demo Account 1</td><td>' + esc(j[0]) + '</td><td class="typ">' + esc(j[1]) + '</td><td>-</td><td>-</td><td>-</td><td>' + pill('Completed') + '</td>' +
            actions('jobs', i, 'job', 'Total Shortage Line Items : ' + N(242133 - i * 4817)) + '</tr>';
        }).join('') + '</tbody>') +
      tf(LIVE.jobs.length ? 1 : 0, LIVE.jobs.length, LIVE.jobs.length + 9)),
    panel('Impact Overview', '', '<div class="pb">' + metrics([['Total Records Scanned', '700,123', 'rec'], ['Hours Saved', '14,159 Hrs', 'hrs'], ['Amount Saved', '$424,770', 'amt'], ['FTE Saved/week', "353 FTE's", 'fte']]) + '</div>') +
    panel('Sub-type Findings', '', '<div class="pb"><div id="cB"></div></div>')
  );
}

function pCoopD() {
  return panel('Dispute Table', BEXP,
    tw('<thead>' + th(['Dispute ID', 'Amount', 'Refund', 'Created By', 'Create Date', 'Resolve Date', 'Reason', 'TAT', 'Status', 'Action'], [1, 2]) + '</thead><tbody>' +
      (LIVE.coopd.length ? LIVE.coopd.map(function (r, i) {
        return '<tr><td class="mono">' + mk(r[0]) + '</td><td class="num">' + D(r[1]) + '</td><td class="num">' + D(r[2]) + '</td>' +
          '<td>' + esc(r[3]) + '</td><td>' + esc(r[4]) + '</td><td>' + esc(r[5]) + '</td><td class="typ">' + esc(r[6]) + '</td><td class="num">' + esc(r[7]) + '</td>' +
          '<td>' + pill(r[8]) + '</td>' + actions('coopd', i, 'edit') + '</tr>';
      }).join('') : '<tr><td colspan="10">' + empty('No data Available — refresh to restore') + '</td></tr>') + '</tbody>') +
    tf(LIVE.coopd.length ? 1 : 0, LIVE.coopd.length, LIVE.coopd.length));
}

function pResult() {
  var tb = RESULT.reduce(function (a, r) { return a + r[1]; }, 0),
      ob = RESULT.reduce(function (a, r) { return a + r[2]; }, 0),
      ub = RESULT.reduce(function (a, r) { return a + r[3]; }, 0),
      no = RESULT.reduce(function (a, r) { return a + r[4]; }, 0);
  return panel('Result Summary', ftoggle('res') + '<button class="btn s">Export Report ' + A_DL + '</button>',
    fpanel('res', [{l:'Search Agreement ID', p:'Search Agreement ID'}, {l:'Amazon VC Account', o:['Demo Account 1', 'Demo Account 2']}],
      '<button class="btn p">Search</button><button class="btn">Reset</button>') +
    tw('<thead><tr><th style="width:26px"><input type="checkbox" aria-label="Select all"></th>' +
      ['Agreement ID', 'Total Billed Amount', 'Overbilled Amount', 'Underbilled Amount', 'Net Off', 'Dispute Percentage', 'Prior Adjustment', 'Recovered Amount']
        .map(function (c, i) { return '<th' + (i > 0 ? ' class="num"' : '') + '>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      RESULT.map(function (r) {
        return '<tr><td><input type="checkbox" aria-label="Select row"></td><td class="mono">' + esc(r[0]) + '</td>' +
          '<td class="num">' + D(r[1]) + '</td><td class="num">' + D(r[2]) + '</td><td class="num">' + D(r[3]) + '</td>' +
          '<td class="num" style="color:var(--amber);font-weight:600">' + D(r[4]) + '</td><td class="num">' + esc(r[5]) + '</td>' +
          '<td class="num">' + D(r[6]) + '</td><td class="num">' + D(r[7]) + '</td></tr>';
      }).join('') + '</tbody>') +
    tf(1, RESULT.length, 19, ['15', '30', '45']) +
    '<div class="totals"><span>Total Billed Amount : <b>' + D(tb) + '</b></span><span>Total Net Off: <b>' + D(no) + '</b></span>' +
    '<span>Total Under Billed Amount : <b>' + SD(-ub) + '</b></span><span>OverBilled Amount: <b>' + D(ob) + '</b></span></div>');
}

/* ---- P&L Analysis ---- */
function pPnl() {
  var rows = [['sec', 'Yearly Comparison'], ['', "PO's Placed", D(4120640.00), D(17994200.00), D(36402100.00)],
   ['', "PO's Accepted", D(3881443.00), D(16767612.00), D(33805951.00)], ['', 'PO Acceptance Rate', '94.2%', '93.2%', '92.9%'],
   ['', 'Payments Received - Inventory Sales', D(3898736.19), D(16885927.90), D(33605315.99)],
   ['', 'Payments Received - Dropship Sales', D(1142877.26), D(2859433.08), D(2215202.31)],
   ['tot', 'Total Payments Received', D(5041613.45), D(19745360.98), D(35820518.30)],
   ['', 'Payment Receipt Forecast', D(10083226.90), '-', '-'], ['', 'Gross Profit', D(2520806.72), D(9872680.49), D(17910259.15)],
   ['', 'SG&A ($)', D(1008322.69), D(3949072.20), D(7164103.66)],
   ['sec', 'Deductions'], ['', 'AMS (Excl. Credit Card)', '0.00%', '0.00%', '0.00%'], ['', 'C2FO Credit Memo', D(0), D(0), D(0)],
   ['', 'CoOp', D(1807977.38) + '<span class="pct">35.86%</span>', D(5204964.71) + '<span class="pct">26.36%</span>', D(5478301.52) + '<span class="pct">15.29%</span>'],
   ['', 'Operational Chargeback Total', D(67370.09) + '<span class="pct">1.34%</span>', D(61833.73) + '<span class="pct">0.31%</span>', D(63428.49) + '<span class="pct">0.18%</span>'],
   ['', 'Net Post Audit Deduction', D(136677.53) + '<span class="pct">2.71%</span>', D(1133945.08) + '<span class="pct">5.74%</span>', D(70379.54) + '<span class="pct">0.20%</span>'],
   ['', 'Net Price Claim', D(109.83), D(11424.59) + '<span class="pct">0.06%</span>', D(13433.94) + '<span class="pct">0.04%</span>'],
   ['', 'Net Shortage', D(321262.08) + '<span class="pct">6.37%</span>', D(2121546.88) + '<span class="pct">10.74%</span>', D(3214862.96) + '<span class="pct">8.97%</span>'],
   ['', 'Return Deduction', D(1923.26) + '<span class="pct">0.04%</span>', D(31327.74) + '<span class="pct">0.16%</span>', D(529.98)],
   ['', 'Net Return Freight Charges', D(9.44), D(93.39), D(0)],
   ['', 'Quick Pay Discount', D(100840.59) + '<span class="pct">2.00%</span>', D(394960.24) + '<span class="pct">2.00%</span>', D(716227.56) + '<span class="pct">2.00%</span>'],
   ['tot', 'Total Deductions', D(2436170.20) + '<span class="pct">48.32%</span>', D(8960104.76) + '<span class="pct">45.38%</span>', D(9557212.67) + '<span class="pct">26.68%</span>'],
   ['sec', 'EBITDA ( $ / % )'], ['', 'EBITDA %', '8.77%', '-5.73%', '2.96%'], ['tot', 'EBITDA $', D(442037.98), '-' + D(1130767.72), D(1059707.28)],
   ['', 'Provision Deduction', D(2058441.54) + '<span class="pct">40.83%</span>', D(16616296.77) + '<span class="pct">84.15%</span>', D(62680248.03) + '<span class="pct">174.98%</span>'],
   ['sec', 'Refunds &amp; Reversals'], ['', 'OC - SIOC Incentive', '-', '-', '-'],
   ['', 'CoOp Refund', D(1099907.73), D(839215.37), D(619945.67)], ['', 'Return Refund', D(0), D(19.48), D(0)],
   ['', 'Provision Reversal', D(2324257.96), D(17682790.67), D(61931066.82)]];

  return strip([
    {k:'EBITDA %', v:'8.77%'}, {k:'EBITDA $', v:D(442037.98), c:'g'},
    {k:'Total Deductions', v:D(2436170.20), c:'r', s:'48.32% of payments'},
    {k:'Total Payments Received', v:D(5041613.45)}, {k:'PO Acceptance Rate', v:'94.2%'}
  ]) +
  '<div class="grid2">' +
  panel('EBITDA ($)', '', '<div class="pb"><div class="chart" id="cE"></div></div>' +
    '<div class="legend"><span><i class="sw" style="background:var(--accent)"></i>2026</span><span><i class="sw" style="background:var(--accent-3)"></i>2025</span><span><i class="sw" style="background:var(--accent-2)"></i>2024</span></div>', 'thousands') +
  panel('Top Deductions', '', '<div class="pb"><div id="cD"></div></div>', 'Jan – Jun 2026') +
  '</div>' +
  panel('Yearly Comparison', BIMP + BEXP + '<button class="btn">Upload Logs ›</button>',
    tw('<thead>' + th(['Categories', 'Jan - Jun 2026', '2025', '2024'], [1, 2, 3]) + '</thead><tbody>' +
      rows.map(function (r) {
        if (r[0] === 'sec') return '<tr class="sec"><td colspan="4">' + r[1] + '</td></tr>';
        return '<tr' + (r[0] === 'tot' ? ' class="tot"' : '') + '><td>' + r[1] + '</td><td class="num">' + r[2] + '</td><td class="num">' + r[3] + '</td><td class="num">' + r[4] + '</td></tr>';
      }).join('') + '</tbody>', 'matrix'));
}

/* ---- Internal Links › Manage Disputes ---- */
function pDispute() {
  var t1 = DISPUTES.reduce(function (a, r) { return a + r[2]; }, 0), t2 = DISPUTES.reduce(function (a, r) { return a + r[3]; }, 0);
  return strip([
    {k:'Dispute Amount', v:D(t1)}, {k:'Refund Amount (as per VC)', v:D(t2), c:'g'},
    {k:'Open Disputes', v:'4', c:'a'}, {k:'Average TAT', v:'3.6 days'}
  ]) +
  panel(FILT.dispute, ftoggle('md') + BIMP + BEXP + '<button class="btn">ReOpen</button>',
    fpanel('md', [{l:'Search DisputeID', p:'Search DisputeID'},
      {l:'Reason List *', o:['Reason List *', 'Shipment Disparity', 'Duplicate Freight', 'Duplicate Billing', 'Non Compliant Fee']},
      {l:'Start Date', p:'mm/dd/yyyy'}, {l:'End Date', p:'mm/dd/yyyy'},
      {l:'Amazon VC Account', o:['Amazon VC Account', 'Demo Account 1', 'Demo Account 2']}],
      '<button class="btn p">Search</button><button class="btn">Reset</button><button class="btn s">Upload Remittance</button>') +
    '<div class="pb" style="padding-bottom:0">' + seg('dispute', ['Resolved', 'Pending With Amazon', 'Pending Vendor Action', 'All']) + '</div>' +
    tw('<thead><tr><th style="width:26px"><input type="checkbox" aria-label="Select all"></th>' +
      ['Vendor Name', 'Dispute id'].map(function (c) { return '<th>' + c + '</th>'; }).join('') +
      '<th class="num">Dispute Amount<span class="tt">(' + PN(t1) + ')</span></th>' +
      '<th class="num">Refund Amount (as per VC)<span class="tt">(' + PN(t2) + ')</span></th>' +
      ['Win Rate', 'Created By', 'Created Date', 'Resolved Date', 'Reason', 'TAT', 'Status'].map(function (c) { return '<th>' + c + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      DISPUTES.map(function (r) {
        return '<tr><td><input type="checkbox" aria-label="Select row"></td><td>' + esc(r[0]) + '</td><td class="mono">' + mk(r[1]) + '</td>' +
          '<td class="num">' + D(r[2]) + '</td><td class="num">' + (r[3] ? D(r[3]) : '-') + '</td><td class="num">' + esc(r[4]) + '</td><td>' + esc(r[5]) + '</td>' +
          '<td>' + esc(r[6]) + '</td><td>' + esc(r[7]) + '</td><td class="typ">' + esc(r[8]) + '</td><td class="num">' + esc(r[9]) + '</td><td>' + pill(r[10]) + '</td></tr>';
      }).join('') + '</tbody>') +
    tf(1, DISPUTES.length, 130, ['15', '30', '45']));
}

function pOnboard() {
  var rows = ONB[FILT.onboard] || [];
  return panel('Manage Onboard Tracker', ftoggle('ob') + '<button class="btn s">Bulk Upload</button>' + BEXP,
    fpanel('ob', [{l:'Amazon VC Account', o:['Amazon VC Account', 'Demo Account 1', 'Demo Account 2', 'Demo Account 8']}],
      '<button class="btn p">Search</button><button class="btn">Reset</button>') +
    '<div class="pb" style="padding-bottom:0">' + seg('onboard', ['Onboarded In Last 30 Days', 'Job Submitted In Last 90 Days', 'Contract Details Not Updated', 'Contract Details Updated']) + '</div>' +
    (rows.length
      ? tw('<thead>' + th(['VC Name', 'Organization Name', 'Amazon VC Account', 'Onboard Date', 'Has Contract', 'Status']) + '</thead><tbody>' +
          rows.map(function (r) {
            return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="mono">' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td>' + esc(r[4]) + '</td><td>' + pill(r[5]) + '</td></tr>';
          }).join('') + '</tbody>') + tf(1, rows.length, rows.length)
      : empty('No data Available')));
}

function pCustomer() {
  return strip([
    {k:'Clients', v:'8'}, {k:'Contracts Already Expired', v:'0', c:'g'},
    {k:'Contracts Expiring in 60 days', v:'1', c:'a'}, {k:'Overbilling Identified', v:D(346239.52)}
  ]) +
  panel('Customer Dashboard',
    '<button class="btn" data-modal="signals">Access Signals</button><button class="btn" data-modal="nojobs">Jobs Not Submitted from Last 90 Days</button>' + ftoggle('cd') + BEXP,
    fpanel('cd', [{l:'Country', o:['Select Country', 'US', 'UK', 'DE']}, {l:'Has Contract', o:['Has Contract', 'Yes', 'No']},
      {l:'Referral Agency', o:['Select Referral Agency', 'Partner', 'Direct']}], '<button class="btn p">Search</button><button class="btn">Reset</button>') +
    tw('<thead>' + th(['Sr No.', 'Country', 'Organization Name', 'VC Name', 'VC Access', 'Onboard Date', 'Tradeplace Fee', 'Payment Terms', 'Referral Agency Name', 'Referral Agency 1 Commission', 'Has Contract', 'Overbilling Recoupment', 'Overbilling Identified', 'Potential Recoup', 'Completion', 'Recovered', 'Pending With Amazon', 'Prior Adjusments', 'Denied Amount'], [0, 12, 13, 15, 16, 17, 18]) + '</thead><tbody>' +
      CUST.map(function (r) {
        function m(v) { return typeof v === 'number' ? D(v) : esc(v); }
        return '<tr><td class="num">' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td class="mono">' + esc(r[4]) + '</td>' +
          '<td>' + esc(r[5]) + '</td><td class="num">' + esc(r[6]) + '</td><td>' + esc(r[7]) + '</td><td>' + esc(r[8]) + '</td><td class="num">' + esc(r[9]) + '</td><td>' + esc(r[10]) + '</td>' +
          '<td class="num">' + esc(r[11]) + '</td><td class="num">' + m(r[12]) + '</td><td class="num">' + m(r[13]) + '</td><td class="num">' + esc(r[14]) + '</td>' +
          '<td class="num">' + m(r[15]) + '</td><td class="num">' + m(r[16]) + '</td><td class="num">' + m(r[17]) + '</td><td class="num">' + m(r[18]) + '</td></tr>';
      }).join('') + '</tbody>') +
    tf(1, CUST.length, 50, ['15', '30', '45']));
}

function pDownloads() {
  return panel('Download Manager', '<button class="btn p">New Export</button>',
    tw('<thead>' + th(['Sl No', 'Vendor Name', 'Source Page', 'Sub Function', 'Requested Date', 'Status', 'Action'], [0]) + '</thead><tbody>' +
      DLMGR.map(function (r) {
        var ready = r[5] === 'Completed';
        return '<tr><td class="num">' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td>' + esc(r[4]) + '</td>' +
          '<td>' + pill(r[5]) + '</td><td>' + (ready ? '<button class="btn p" style="padding:3px 11px;border-radius:999px;font-size:11px">Download Now</button>' : '<span style="color:var(--ink-3)">—</span>') + '</td></tr>';
      }).join('') + '</tbody>') +
    tf(1, DLMGR.length, DLMGR.length));
}

function pAccess() {
  var tabs = seg('access', ['Clients', 'Users', 'Groups']);
  var body;
  if (FILT.access === 'Users') {
    body = tw('<thead>' + th(['Customer Email', 'Role', 'Client', 'Vendors', 'Last Active', 'Status']) + '</thead><tbody>' +
      USERS.map(function (r) {
        return '<tr><td class="mono">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td>' + esc(r[4]) + '</td><td>' + pill(r[5]) + '</td></tr>';
      }).join('') + '</tbody>') + tf(1, USERS.length, USERS.length);
  } else if (FILT.access === 'Groups') {
    body = tw('<thead>' + th(['Group', 'Members', 'Menus', 'Vendors', 'Created', 'Status'], [1]) + '</thead><tbody>' +
      GROUPS.map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + r[1] + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td><td>' + esc(r[4]) + '</td><td>' + pill(r[5]) + '</td></tr>';
      }).join('') + '</tbody>') + tf(1, GROUPS.length, GROUPS.length);
  } else {
    body = tw('<thead>' + th(['SL No.', 'Market Place', 'Organization Name', 'Amazon VC Account', 'Shortage Monthly Cron Job', 'Ops Chargeback', 'Itemized Shortage', 'Itemized Price Claim', 'Action'], [0]) + '</thead><tbody>' +
      CLIENTS.map(function (r) {
        function tg(v) { return '<td><span class="toggle' + (v === 'Yes' ? ' on' : '') + '"><i></i></span></td>'; }
        return '<tr><td class="num">' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td class="mono">' + esc(r[3]) + '</td>' +
          tg(r[4]) + tg(r[5]) + tg(r[6]) + tg(r[7]) +
          '<td><div class="act"><button title="Edit" aria-label="Edit">' + A_EDIT + '</button></div></td></tr>';
      }).join('') + '</tbody>') + tf(1, CLIENTS.length, CLIENTS.length);
  }
  var add = FILT.access === 'Users' ? 'Add Users' : FILT.access === 'Groups' ? 'Add Groups' : 'Add Clients';
  return panel('Manage Clients', ftoggle('ac') + BEXP + '<button class="btn p">' + add + '</button>',
    fpanel('ac', [{l:'Search', p:'Search'}, {l:'Market Place', o:['Market Place', 'US', 'UK', 'DE', 'CA']}],
      '<button class="btn p">Search</button><button class="btn">Reset</button>') +
    '<div class="pb" style="padding-bottom:0">' + tabs + '</div>' + body);
}

/* =========================================================================
   ROUTER
   ========================================================================= */
var view = document.getElementById('view'), nav = document.getElementById('nav');
var rail = document.getElementById('rail'), scrim = document.getElementById('scrim');
var crumbs = document.getElementById('crumbs'), ptitle = document.getElementById('ptitle');
var modal = document.getElementById('modal'), mBody = document.getElementById('mBody'), mTitle = document.getElementById('mTitle');
var toast = document.getElementById('toast'), toastMsg = document.getElementById('toastMsg'), tTimer;
var current = 'dashboard';
var B = {dashboard:pDashboard, ongoing:pOngoing, bulk:pBulk, price:pPrice, ops:pOps, missed:pMissed, coop:pCoop, pnl:pPnl,
 dispute:pDispute, onboard:pOnboard, customer:pCustomer, coopd:pCoopD, result:pResult, downloads:pDownloads, access:pAccess};

function paintNav() {
  nav.innerHTML = PAGES.map(function (p) {
    var btn = '<button data-id="' + p.id + '"' + (p.kids ? ' data-toggle="1"' : '') + '><svg class="ico" viewBox="0 0 20 20" fill="none" aria-hidden="true">' + I[p.i] + '</svg><span>' + esc(p.t) + '</span>' +
      (p.kids ? '<svg class="chev' + (NAVOPEN ? ' open' : '') + '" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="m3 4.5 3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') + '</button>';
    if (p.kids && NAVOPEN) btn += '<div class="subnav">' + p.kids.map(function (c) {
      return '<button data-id="' + c.id + '"><svg class="ico" viewBox="0 0 20 20" fill="none" aria-hidden="true">' + I[c.i] + '</svg><span>' + esc(c.t) + '</span></button>';
    }).join('') + '</div>';
    return btn;
  }).join('');
  var hl = NAVFOR[current] || current;
  Array.prototype.forEach.call(nav.querySelectorAll('button[data-id]'), function (b) {
    if (b.dataset.id === hl) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
}
function render(id) {
  if (!B[id]) id = 'dashboard';
  current = id;
  ptitle.textContent = TITLE[id];
  var trail = CRUMB[id] || [[TITLE[id], null]];
  var parts = [trail.length ? '<button data-go="dashboard">Dashboard</button>' : '<b>Dashboard</b>'];
  trail.forEach(function (c, i) {
    parts.push('<span class="sep">/</span>');
    parts.push(c[1] && i < trail.length - 1
      ? '<button data-go="' + c[1] + '">' + esc(c[0]) + '</button>'
      : '<b>' + esc(c[0]) + '</b>');
  });
  crumbs.innerHTML = parts.join(' ');
  view.innerHTML = B[id]();
  draw(id);
  paintNav();
  window.scrollTo(0, 0);
  closeRail();
  if (location.hash.replace('#', '') !== id) history.replaceState(null, '', '#' + id);
}
function draw(id) {
  var $ = function (s) { return document.getElementById(s); };
  if (id === 'dashboard') donut($('dP'), 100, 'Approved');
  if (id === 'coop') {
    spark($('cS'), SPARK);
    bars($('cW'), [['Shipment Disparity', 0], ['Duplicate Billing', 0], ['Duplicate Freight', 0], ['Non-Compliant Freight', 0], ['Non Compliant Fee', 0]], function () { return 'No Finding'; });
    bars($('cB'), COOP_SUB.map(function (r) { return [r[0], r[1]]; }));
  }
  if (id === 'pnl') {
    multi($('cE'), EB, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 'EBITDA in dollars by year');
    bars($('cD'), [['CoOp', 1807977.38], ['Net Shortage', 321262.08], ['Net Post Audit', 136677.53], ['Quick Pay Discount', 100840.59], ['Ops Chargeback', 67370.09], ['Return Deduction', 1923.26]]);
  }
}

/* ---------- dialogs ---------- */
function openModal(kind) {
  if (kind === 'yoy') {
    mTitle.textContent = 'YOY Split';
    mBody.innerHTML = YOY.map(function (r) {
      return '<div class="yoy"><span style="color:var(--accent-3)">' + esc(r[0]) + '</span><b style="color:' + (r[1] < 0 ? 'var(--crit)' : 'var(--ink)') + '">' + SD(r[1]) + '</b></div>';
    }).join('');
  }
  if (kind === 'req') {
    /* production hardcodes this title for both New Request options */
    mTitle.textContent = 'Shortage Reconciliation Request';
    mBody.innerHTML = '<div style="padding:12px 16px 0"><span class="xl">View History</span></div>' +
      '<div style="padding:10px 16px 0;font-size:12px;font-weight:600">Date Range</div>' +
      '<div style="display:flex;gap:10px;align-items:flex-end;padding:8px 16px 0">' +
      '<div class="fld" style="flex:1"><label>Start Date *</label><input type="text" placeholder="mm/dd/yyyy"></div>' +
      '<span style="padding-bottom:8px;color:var(--ink-3)">→</span>' +
      '<div class="fld" style="flex:1"><label>End Date (Optional)</label><input type="text" placeholder="mm/dd/yyyy"></div></div>' +
      '<div class="hint" style="padding-top:10px">If End Date is blank, today’s date will be used.</div>' +
      '<div class="sf"><button class="btn s" data-close="1">Save</button><button class="btn p" data-close="1">Close</button></div>';
  }
  if (kind === 'upload') {
    mTitle.textContent = 'Findings Upload Logs';
    mBody.innerHTML = '<div class="fpanel" style="border-bottom:1px solid var(--line)">' +
      '<div class="fld"><label>Reason</label><select><option>Select Reason</option><option>Shortage</option><option>Price Claim</option></select></div>' +
      '<div class="fld"><label>Amazon VC Account</label><select><option>Select Account</option><option>Demo Account 1</option></select></div>' +
      '<div class="fact"><button class="btn p">Search</button><button class="btn">Reset</button></div></div>' +
      empty('No data Available') +
      '<div class="sf"><button class="btn p" data-close="1">Close</button></div>';
  }
  if (kind === 'signals') {
    mTitle.textContent = 'Access Signals';
    mBody.innerHTML = '<div style="padding:4px 0">' +
      ['Demo Account 1', 'Demo Account 2', 'Demo Account 3', 'Demo Account 4'].map(function (v, i) {
        return '<div class="yoy"><span>' + esc(v) + '</span>' + pill(i === 3 ? 'Pending' : 'Active') + '</div>';
      }).join('') + '</div><div class="sf"><button class="btn p" data-close="1">Close</button></div>';
  }
  if (kind === 'nojobs') {
    mTitle.textContent = 'Jobs Not Submitted from Last 90 Days';
    mBody.innerHTML = '<div style="padding:4px 0">' +
      [['Demo Account 8', '112 days'], ['Demo Account 6', '96 days']].map(function (r) {
        return '<div class="yoy"><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>';
      }).join('') + '</div><div class="sf"><button class="btn p" data-close="1">Close</button></div>';
  }
  modal.hidden = false;
}
function closeModal() { modal.hidden = true; }
document.getElementById('mClose').addEventListener('click', closeModal);
modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

function showToast(msg) {
  toastMsg.textContent = msg;
  toast.hidden = false;
  clearTimeout(tTimer);
  tTimer = setTimeout(function () { toast.hidden = true; }, 4200);
}

/* ---------- events ---------- */
nav.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-id]'); if (!b) return;
  if (b.dataset.toggle) { NAVOPEN = !NAVOPEN; paintNav(); return; }
  render(b.dataset.id);
});
view.addEventListener('change', function (e) {
  var r = e.target.closest('select[data-req]');
  if (r && r.selectedIndex > 0) { openModal('req'); r.selectedIndex = 0; }
});
view.addEventListener('click', function (e) {
  var ft = e.target.closest('[data-ft]');
  if (ft) {
    var k = ft.getAttribute('data-ft');
    FOPEN[k] = !FOPEN[k];
    ft.setAttribute('aria-expanded', !!FOPEN[k]);
    var p = view.querySelector('[data-fp="' + k + '"]');
    if (p) p.hidden = !FOPEN[k];
    return;
  }
  var m = e.target.closest('[data-modal]'); if (m) { openModal(m.getAttribute('data-modal')); return; }
  if (e.target.closest('[data-track]')) { showToast('File Download Requested Successfully, Please Check In Download Manager'); return; }
  var g = e.target.closest('[data-go]'); if (g) { render(g.getAttribute('data-go')); return; }
  var d = e.target.closest('button[data-del]');
  if (d) {
    var set = d.getAttribute('data-del'), i = parseInt(d.getAttribute('data-i'), 10);
    if (LIVE[set]) { LIVE[set].splice(i, 1); render(current); }
    return;
  }
  var t = e.target.closest('.toggle');
  if (t) { t.classList.toggle('on'); return; }
  var c = e.target.closest('[data-seg] button[data-v]'); if (!c) return;
  FILT[c.closest('[data-seg]').getAttribute('data-seg')] = c.dataset.v;
  render(current);
});
function openRail() { rail.classList.add('open'); scrim.classList.add('on'); }
function closeRail() { rail.classList.remove('open'); scrim.classList.remove('on'); }
document.getElementById('menuBtn').addEventListener('click', openRail);
scrim.addEventListener('click', closeRail);

/* theme toggle — per-viewer convenience only */
var tb = document.getElementById('themeBtn');
try { var saved = localStorage.getItem('ts-theme'); if (saved) document.documentElement.setAttribute('data-theme', saved); } catch (err) {}
tb.addEventListener('click', function () {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme:dark)').matches);
  var next = dark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('ts-theme', next); } catch (err) {}
});

/* breadcrumb navigation */
crumbs.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-go]');
  if (b) render(b.getAttribute('data-go'));
});

/* notifications */
var bell = document.getElementById('bell'), notif = document.getElementById('notif'), bellCount = document.getElementById('bellCount');
function paintNotif() {
  var unread = NOTIF.filter(function (n) { return n.u; }).length;
  bellCount.textContent = unread;
  bellCount.style.display = unread ? '' : 'none';
  notif.innerHTML =
    '<div class="nhead"><h3>Notifications</h3><span class="c">' + unread + ' unread</span></div>' +
    '<div class="nlist">' + NOTIF.map(function (n, i) {
      return '<button class="nitem' + (n.u ? '' : ' read') + '" data-n="' + i + '">' +
        '<span class="dotm" style="background:' + (n.u ? n.c : 'var(--line)') + '"></span>' +
        '<span style="min-width:0"><span class="t">' + esc(n.t) + '</span>' +
        '<span class="m">' + esc(n.m) + '</span>' +
        '<span class="m" style="opacity:.8">' + esc(n.w) + '</span></span></button>';
    }).join('') + '</div>' +
    '<div class="nfoot"><button class="btn" style="padding:4px 10px;font-size:11px" data-nread="1">Mark all read</button>' +
    '<span class="spacer"></span><button class="btn" style="padding:4px 10px;font-size:11px" data-go="downloads">Download Manager ›</button></div>';
}
function closeNotif() { notif.hidden = true; bell.setAttribute('aria-expanded', 'false'); }
bell.addEventListener('click', function (e) {
  e.stopPropagation();
  notif.hidden = !notif.hidden;
  bell.setAttribute('aria-expanded', String(!notif.hidden));
});
notif.addEventListener('click', function (e) {
  e.stopPropagation();
  if (e.target.closest('[data-nread]')) { NOTIF.forEach(function (n) { n.u = 0; }); paintNotif(); return; }
  var g = e.target.closest('[data-go]');
  if (g) { closeNotif(); render(g.getAttribute('data-go')); return; }
  var it = e.target.closest('[data-n]');
  if (it) {
    var n = NOTIF[parseInt(it.getAttribute('data-n'), 10)];
    n.u = 0; paintNotif(); closeNotif();
    if (n.g) render(n.g);
  }
});
document.addEventListener('click', closeNotif);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNotif(); });
paintNotif();

document.getElementById('signout').addEventListener('click', function () {
  try { sessionStorage.removeItem('ts-demo-session'); } catch (err) {}
  location.replace('login.html');
});

window.addEventListener('hashchange', function () {
  var s = location.hash.replace('#', '');
  if (B[s] && s !== current) render(s);
});
var start = location.hash.replace('#', '');
render(B[start] ? start : 'dashboard');
})();
