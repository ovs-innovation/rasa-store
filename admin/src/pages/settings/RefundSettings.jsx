import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { notifySuccess, notifyError } from "@/utils/toast";
import RefundServices from "@/services/RefundServices";
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiInfo,
  FiX,
  FiPower
} from "react-icons/fi";
import { Button, Table, TableHeader, TableCell, TableBody, TableRow, TableContainer, Pagination, Modal, ModalHeader, ModalBody, ModalFooter } from "@windmill/react-ui";

// internal import
import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import SwitchToggle from "@/components/form/switch/SwitchToggle";

const RefundSettings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [refundMode, setRefundMode] = useState(true);
  const [activeTab, setActiveTab] = useState("Default");
  const [newReason, setNewReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reasons, setReasons] = useState([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [editTab, setEditTab] = useState("Default");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Refund Mode Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  useEffect(() => {
    const fetchRefundSettings = async () => {
      try {
        setLoading(true);
        const res = await RefundServices.getRefundData();
        if (res) {
          setRefundMode(res.refundMode ?? true);
          setReasons(res.reasons || []);
        }
      } catch (err) {
        notifyError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRefundSettings();
  }, []);

  const handleAddReason = async () => {
    if (newReason.trim()) {
      try {
        setLoading(true);
        await RefundServices.addRefundReason({
          title: newReason,
          status: "show"
        });
        const res = await RefundServices.getRefundData();
        setReasons(res.reasons || []);
        setNewReason("");
        notifySuccess("Refund reason added successfully!");
      } catch (err) {
        notifyError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleRefundModeClick = () => {
    setIsRefundModalOpen(true);
  };

  const confirmRefundModeChange = async () => {
    const newMode = !refundMode;
    try {
      setLoading(true);
      await RefundServices.updateRefundMode({ refundMode: newMode });
      setRefundMode(newMode);
      setIsRefundModalOpen(false);
      notifySuccess(`Refund request mode turned ${newMode ? 'on' : 'off'}`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await RefundServices.deleteRefundReason(deletingId);
      setReasons(reasons.filter(r => r._id !== deletingId));
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      notifySuccess("Refund reason deleted successfully!");
    } catch (err) {
      notifyError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const reason = reasons.find(r => r._id === id);
      const newStatus = reason.status === "show" ? "hide" : "show";
      await RefundServices.updateStatus(id, { status: newStatus });
      setReasons(reasons.map(r => r._id === id ? { ...r, status: newStatus } : r));
      notifySuccess(`Status updated to ${newStatus}`);
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleEditClick = (reason) => {
    setEditingReason({ ...reason });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (editingReason.title.trim()) {
      try {
        setLoading(true);
        await RefundServices.updateRefundReason(editingReason._id, {
          title: editingReason.title,
          status: editingReason.status
        });
        setReasons(reasons.map(r => r._id === editingReason._id ? editingReason : r));
        setIsEditModalOpen(false);
        setEditingReason(null);
        notifySuccess("Refund reason updated successfully!");
      } catch (err) {
        notifyError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredReasons = reasons.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageTitle>{t("Refund Settings")}</PageTitle>
      <AnimatedContent>
        <div className="space-y-6">
          {/* Refund Request Mode Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 ">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Refund Request Mode</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Customers can't request a Refund if Admin doesn't specify a cause for Refund. Admin MUST provide a Refund Reason.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">Refund Request Mode</span>
                <div className="scale-60 mt-2">
                   <SwitchToggle
                     processOption={refundMode}
                     handleProcess={handleRefundModeClick}
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Add Refund Reason Section */}
          <div className="  bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Add Refund Reason</h3>
              <p className="text-sm text-gray-500 mt-1">
                Users cannot cancel an order if the Admin does not specify a cause for cancellation even though
              </p>
            </div>
            <div className="p-6 bg-gray-50/50 dark:bg-gray-900/20">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                {/* Tabs */}
                <div className="flex items-center gap-6 mb-6 border-b dark:border-gray-700">
                  {["Default", "English(EN)"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-bold transition-all relative ${
                        activeTab === tab 
                        ? "text-emerald-500 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-500" 
                        : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Refund Reason ({activeTab}) 
                      <FiInfo className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        placeholder="Ex: Item is Broken"
                        className=" w-full h-24 p-4 text-sm border border-gray-250 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                      />
                      <span className="absolute bottom-3 right-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {newReason.length}/150
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      layout="link"
                      onClick={() => setNewReason("")}
                      className="px-8 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-white rounded-lg font-bold text-sm"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleAddReason}
                      className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Reasons List Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Refund Reasons</h3>
                <p className="text-xs text-gray-500 font-medium">Manage predefined reasons for order refunds</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reasons..."
                    className="pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-64 transition-all"
                  />
                </div>
      
              </div>
            </div>

            <TableContainer className="border-t dark:border-gray-700">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/40">
                  <TableRow>
                    <TableCell className="text-[10px] font-bold uppercase text-gray-400">SN</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase text-gray-400">REASON</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase text-gray-400 text-center">STATUS</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase text-gray-400 text-right pr-12">ACTION</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReasons.map((reason, index) => (
                    <TableRow key={reason._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                      <TableCell className="text-sm font-bold text-gray-600 dark:text-gray-400">{index + 1}</TableCell>
                      <TableCell className="text-sm font-bold text-gray-700 dark:text-white">{reason.title}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center scale-90">
                          <SwitchToggle
                            processOption={reason.status === "show"}
                            handleProcess={() => handleToggleStatus(reason._id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(reason)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all border border-blue-100 dark:border-blue-800/30"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(reason._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-all border border-rose-100 dark:border-rose-800/30"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="p-6 border-t dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs font-bold text-gray-400">
                Showing 1-{filteredReasons.length} of {reasons.length} Reasons
              </p>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-1">
                    <button className="p-1 px-2 text-xs font-bold text-gray-400 hover:text-gray-600">Previous</button>
                    <button className="w-6 h-6 flex items-center justify-center text-xs font-black bg-emerald-50 text-emerald-600 rounded-md">1</button>
                    <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-gray-600">2</button>
                    <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-gray-600">3</button>
                    <button className="p-1 px-2 text-xs font-bold text-gray-400 hover:text-gray-600">Next</button>
                 </div>
                 <div className="relative">
                    <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-1.5 pr-8 text-xs font-bold text-gray-600 dark:text-gray-400 outline-none">
                      <option>Reasons per page</option>
                      <option>10 per page</option>
                      <option>20 per page</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContent>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700">
          <span className="text-lg font-bold text-gray-800 dark:text-white">Edit Refund Reason</span>
          <button 
            onClick={() => setIsEditModalOpen(false)}
            className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </ModalHeader>
        <ModalBody className="p-6 bg-gray-50/50 dark:bg-gray-900/20">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                {/* Tabs */}
                <div className="flex items-center gap-6 mb-6 border-b dark:border-gray-700">
                  {["Default", "English(EN)"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEditTab(tab)}
                      className={`pb-3 text-sm font-bold transition-all relative ${
                        editTab === tab 
                        ? "text-emerald-500 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-500" 
                        : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                       Refund Reason ({editTab}) 
                      <FiInfo className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={editingReason?.title || ""}
                        onChange={(e) => setEditingReason({ ...editingReason, title: e.target.value })}
                        className="w-full h-32 p-4 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none shadow-sm"
                      />
                      <span className="absolute bottom-3 right-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {(editingReason?.title || "").length}/150
                      </span>
                    </div>
                  </div>
                </div>
              </div>
        </ModalBody>
        <ModalFooter className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-between gap-4">
          <Button
            onClick={() => setIsEditModalOpen(false)}
            className="flex-1 py-3 bg-[#a5b2c2] hover:bg-[#94a1b0] text-white rounded-lg font-bold text-sm shadow-sm transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className="flex-1 py-3 bg-[#0a7a7a] hover:bg-[#086666] text-white rounded-lg font-bold text-sm shadow-sm transition-all"
          >
            Update
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalBody className=" p-2 bg-white dark:bg-gray-800 rounded-3xl relative  ">
          <div className="flex flex-col items-center text-center">
            {/* Close Button Top Right */}
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="  absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400"
            >
              <FiX className="w-4 h-4"/>
            </button>

            {/* Red Circle Icon */}
            <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 mb-8 border-[6px] border-white dark:border-gray-700">
               <FiPower className="w-10 h-10 text-white stroke-[3]" />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Are you sure ?</h2>
            <p className="text-gray-500 font-medium mb-8">Want to delete this refund reason ?</p>

            {/* Action Buttons */}
            <div className=" flex items-center justify-center gap-4 w-full mt-5">
               <button 
                 onClick={() => setIsDeleteModalOpen(false)}
                 className="flex-1 max-w-[140px] py-3 bg-[#e4e9f0] hover:bg-[#d5dde8] text-gray-700 font-bold rounded-lg transition-all"
               >
                 No
               </button>
               <button 
                 onClick={confirmDelete}
                 className="flex-1 max-w-[140px] py-3 bg-[#0a7a7a] hover:bg-[#086666] text-white font-bold rounded-lg transition-all shadow-md shadow-emerald-900/20"
               >
                 Yes
               </button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Refund Mode Confirmation Modal */}
      <Modal isOpen={isRefundModalOpen} onClose={() => setIsRefundModalOpen(false)}>
        <ModalBody className="px-2 bg-white dark:bg-gray-800 rounded-3xl relative  ">
          <div className="flex flex-col items-center text-center">
            {/* Close Button Top Right */}
            <button 
              onClick={() => setIsRefundModalOpen(false)}
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5"/>
            </button>

            {/* Warning Icon - Using an SVG to match the image precisely */}
            <div className="w-24 h-24 mb-6 flex items-center justify-center">
              <div className="w-full h-full border-4 border-orange-200 rounded-full flex items-center justify-center">
                <div className="text-orange-300 text-5xl font-light">!</div>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-3">Are you sure ?</h2>
            <p className="text-gray-500 text-base mb-8">
              Be careful before you turn on/off Refund Request mode
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 w-full">
               <button 
                 onClick={() => setIsRefundModalOpen(false)}
                 className="flex-1 max-w-[160px] py-3 bg-[#e8eef3] hover:bg-[#d9e2ea] text-gray-600 font-bold rounded-lg transition-all"
               >
                 No
               </button>
               <button 
                 onClick={confirmRefundModeChange}
                 className="flex-1 max-w-[160px] py-3 bg-[#0a7a7a] hover:bg-[#086666] text-white font-bold rounded-lg transition-all shadow-md"
               >
                 Yes
               </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default RefundSettings;
