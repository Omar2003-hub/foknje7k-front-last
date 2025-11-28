import React, { useEffect, useState } from "react";
import { getStudentRequestsFromIDB, setStudentRequestsToIDB, clearStudentRequestsCache } from '../../../utils/idbStudentRequests';
import CustomTable from "../../../shared/custom-table/custom-table";
import { columnsRequestsStudent } from "../../../mocks/fakeData";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Button,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getAllStudentRequests,
  respondOfferService,
  getAvailableSubjects,
} from "../../../services/student-offer";

interface RequestData {
  id: number;
  nom: string;
  offerType: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  startDate: string;
  endDate: string;
  paymentImageUrl: string;
  subjects: string;
  subjectCount: number;
  totalPrice: string;
  paidAmount?: number;
  baseAmount?: number;
}

type TableData = Record<string, any>;

const Requests = () => {
  const CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RequestData | null>(null);
  const [data, setData] = useState<RequestData[]>([]);
  const [originalData, setOriginalData] = useState<RequestData[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [slectedStatus, setSelectedStatus] = useState<"ACCEPTED" | "REJECTED">("ACCEPTED");
  const [confirmAction, setConfirmAction] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"asc" | "desc" | "none">("none");

  const fetchData = async () => {
    try {
      // Try to get cached requests from IndexedDB
      const cached = await getStudentRequestsFromIDB();
      const now = Date.now();

      if (cached && Array.isArray(cached.requests) && cached.timestamp && now - cached.timestamp < CACHE_MAX_AGE) {
        setData(cached.requests);
        setOriginalData(cached.requests);
        setLoading(false);
        return;
      }

      setLoading(true);
      let subjectsArr: any[] = [];
      // Always fetch subjects fresh (they may change)
      const subjectsRes = await getAvailableSubjects();
      subjectsArr = Array.isArray(subjectsRes) ? subjectsRes : subjectsRes.data || [];
      setSubjectsList(subjectsArr);

      // If no cache or cache is old, fetch from API
      const res = await getAllStudentRequests();
      console.log('Raw student requests:', res.data);
      const formattedData = res.data.map((item: any) => {
        // Debug: log each item
        console.log('Student request item:', item);
        const subjectCount = item.requestedSubjectsCount ?? item.subjectCount ?? (Array.isArray(item.subjectIds) ? item.subjectIds.length : 0);
        const selectedPeriod = item.selectedPeriod ?? item.period ?? 'MONTHLY';

        // Get the price based on selected period
        let unitPrice = 0;
        if (item.studentOffer) {
          switch (selectedPeriod) {
            case 'MONTHLY':
              unitPrice = item.studentOffer.monthlyPrice || 0;
              break;
            case 'TRIMESTER':
              unitPrice = item.studentOffer.trimesterPrice || 0;
              break;
            case 'SEMESTER':
              unitPrice = item.studentOffer.semesterPrice || 0;
              break;
            case 'YEARLY':
              unitPrice = item.studentOffer.yearlyPrice || 0;
              break;
            default:
              unitPrice = item.studentOffer.monthlyPrice || 0;
          }
        }

        // Apply special multipliers for YEARLY period
        let subjectMultiplier = subjectCount;
        if (selectedPeriod === 'YEARLY') {
          switch (subjectCount) {
            case 1: subjectMultiplier = 1; break;
            case 2: subjectMultiplier = 1.5; break;
            case 3: subjectMultiplier = 2.25; break;
            case 4: subjectMultiplier = 3; break;
            default: subjectMultiplier = subjectCount;
          }
        } else {
          // For other periods, 4 subjects = 3.5x
          subjectMultiplier = subjectCount === 4 ? 3.5 : subjectCount;
        }
        const total = Math.floor(unitPrice * subjectMultiplier);
        const isFree = total === 0;
        const paid = typeof item.paidAmount === "number" ? Math.floor(item.paidAmount) : total;
        const showSavings = paid < total;

        // Format period label in French
        const periodLabels: Record<string, string> = {
          'MONTHLY': 'Mensuel',
          'TRIMESTER': 'Trimestriel',
          'SEMESTER': 'Semestriel',
          'YEARLY': 'Annuel'
        };
        const periodLabel = periodLabels[selectedPeriod] || selectedPeriod;

        return {
          ...item,
          id: item.id,
          nom: item.studentName || "Inconnu",
          offerType: item.studentOffer?.title || "Type inconnu",
          status: item.status,
          createdAt: item.requestDate,
          startDate: item.startDate,
          endDate: item.status === "PENDING" ? "N/A" : item.endDate,
          paymentImageUrl: item.paymentImageUrl || "#",
          period: periodLabel,
          subjects: (isFree || item.studentOffer?.allSubjects)
            ? `Toutes les matières`
            : `${subjectCount} matière${subjectCount > 1 ? 's' : ''}`,
          totalPrice: isFree
            ? "Gratuit"
            : showSavings
              ? `${paid} TND (au lieu de ${total} TND)`
              : `${paid} TND`,
          paidAmount: paid,
          baseAmount: total,
        };
      });
      setData(formattedData);
      setOriginalData(formattedData);
      setStudentRequestsToIDB('studentRequests', formattedData, now);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (originalData.length === 0) return;

    let filteredData = [...originalData];

    if (searchName.trim()) {
      const searchTerm = searchName.toLowerCase().trim();
      filteredData = filteredData.filter((item) =>
        item.nom.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedStatusFilter !== "all") {
      filteredData = filteredData.filter(
        (item) => item.status === selectedStatusFilter
      );
    }

    if (dateFilter !== "none") {
      filteredData.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        let comparison =
          dateFilter === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();

        if (comparison === 0) {
          comparison = dateFilter === "asc" ? a.id - b.id : b.id - a.id;
        }

        if (comparison === 0 && a.startDate && b.startDate) {
          const startA = new Date(a.startDate);
          const startB = new Date(b.startDate);
          comparison =
            dateFilter === "asc"
              ? startA.getTime() - startB.getTime()
              : startB.getTime() - startA.getTime();
        }

        return comparison;
      });
    }

    setData(filteredData);
  }, [searchName, selectedStatusFilter, dateFilter, originalData]);

  const handleResetFilters = () => {
    setSearchName("");
    setSelectedStatusFilter("all");
    setDateFilter("none");
    setData(originalData);
  };

  const handleActionClick = (
    row: RequestData,
    action: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    setSelectedRow(row);
    setConfirmAction(action);
    setOpenConfirmDialog(true);
    setSelectedStatus(status);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedRow(null);
  };

  const handleActionConfirm = async () => {
    if (!selectedRow) return;
    setLoading(true);
    try {
      await respondOfferService(selectedRow.id, slectedStatus);
      // Clear cache before fetching new data
      await clearStudentRequestsCache();
      await fetchData();
      setOpenConfirmDialog(false);
      setSelectedRow(null);
    } catch (e) {
      console.error("Error responding to offer:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderActions = (row: TableData) => {
    const requestRow = row as RequestData;
    return (
      <div className="flex items-center justify-center space-x-2">
        {requestRow.status === "PENDING" ? (
          <>
            <button
              className="px-3 py-1 text-white rounded-full bg-primary_bg"
              onClick={() => handleActionClick(requestRow, "Accepted", "ACCEPTED")}
            >
              Accept
            </button>
            <button
              onClick={() => handleActionClick(requestRow, "Rejected", "REJECTED")}
              className="px-3 py-1 text-white rounded-full bg-red"
            >
              Reject
            </button>
          </>
        ) : (
          <span className="text-gray-500">
            {requestRow.status === "ACCEPTED" ? "Accepted" : "Rejected"}
          </span>
        )}
      </div>
    );
  };

  const renderStatus = (row: TableData) => {
    const requestRow = row as RequestData;
    return (
      <div className="flex items-center justify-center space-x-2">
        <a
          className="px-3 py-1 text-white rounded-full bg-text"
          href={requestRow.paymentImageUrl}
          target="_blank"
          rel="noreferrer"
        >
          Voir le Doc
        </a>
      </div>
    );
  };


  // On refresh, clear cache and fetch new data
  const handleRefresh = async () => {
    setLoading(true);
    await clearStudentRequestsCache();
    await fetchData();
  };

  return (
    <div className="w-full p-1 lg:p-10">
      <div className="flex justify-end mb-4">
        <Button
          variant="contained"
          onClick={() => handleRefresh()}
          disabled={loading}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#388E3C',
            },
          }}
          startIcon={<RefreshIcon />}
        >
          Actualiser
        </Button>
      </div>
      <div className="flex flex-col items-start justify-between w-full mb-5 space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl text-title font-montserrat_bold md:text-3xl">
          Les Demandes des élèves
        </h1>
      </div>

      {/* Filtres */}
      <Box sx={{ mb: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Rechercher par nom"
              variant="outlined"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={selectedStatusFilter}
                label="Statut"
                onChange={(e) => setSelectedStatusFilter(e.target.value as string)}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="PENDING">En attente</MenuItem>
                <MenuItem value="ACCEPTED">Accepté</MenuItem>
                <MenuItem value="REJECTED">Rejeté</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tri par date</InputLabel>
              <Select
                value={dateFilter}
                label="Tri par date"
                onChange={(e) => setDateFilter(e.target.value as "asc" | "desc" | "none")}
              >
                <MenuItem value="none">Aucun tri</MenuItem>
                <MenuItem value="asc">Plus ancien</MenuItem>
                <MenuItem value="desc">Plus récent</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleResetFilters}
              sx={{
                height: '56px',
                backgroundColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#388E3C',
                },
              }}
            >
              Réinitialiser les filtres
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Chargement en cours...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Aucune donnée disponible</p>
        </div>
      ) : (
        <CustomTable
          title="Gérer Demandes des élèves"
          columns={[
            ...columnsRequestsStudent,
            {
              Header: "Matières",
              accessor: "subjects",
            },
            {
              Header: "Période",
              accessor: "period",
            },
            {
              Header: "Prix total",
              accessor: "totalPrice",
            },
          ]}
          data={data}
          actions={renderActions}
          status={renderStatus}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmer</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir {confirmAction.toLowerCase()} la demande de{" "}
          {selectedRow?.nom || "cet utilisateur"} ?
        </DialogContent>
        <DialogActions>
          <button
            className="px-2 py-1 text-white rounded bg-red"
            onClick={handleCloseConfirmDialog}
          >
            Annuler
          </button>
          <button
            className="px-2 py-1 text-white rounded bg-primary"
            onClick={handleActionConfirm}
          >
            {confirmAction}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Requests;
