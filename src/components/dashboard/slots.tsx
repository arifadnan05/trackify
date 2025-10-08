import {
  Edit,
  Trash2,
  Plus,
  ParkingCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  addSlot,
  deleteSlot,
  getSlots,
  updateSlot,
  getSlotStats,
} from "@/app/actions/slotAction";
import { Suspense } from "react";
import { revalidatePath } from "next/cache";

// Stats Loading Skeleton
function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-300 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Stats Component with Server-side Data Fetching
async function StatsCards() {
  const stats = await getSlotStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Slots
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ParkingCircle className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Available</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.available}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Booked</p>
            <p className="text-3xl font-bold text-gray-800">{stats.booked}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.occupancyRate}% occupancy
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="text-red-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 📋 Slots Table Loading Skeleton
function TableLoadingSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-4 px-4 text-gray-600 font-semibold">
              Slot Number
            </th>
            <th className="text-left py-4 px-4 text-gray-600 font-semibold">
              Status
            </th>
            <th className="text-left py-4 px-4 text-gray-600 font-semibold">
              Booked By
            </th>
            <th className="text-right py-4 px-4 text-gray-600 font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="border-b border-gray-100 animate-pulse">
              <td className="py-4 px-4">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="py-4 px-4">
                <div className="h-8 bg-gray-200 rounded-full w-24"></div>
              </td>
              <td className="py-4 px-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 📋 Slots Table Component
async function SlotsTable() {
  const slots = await getSlots();

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <ParkingCircle className="mx-auto text-gray-300 mb-4" size={64} />
        <p className="text-gray-500 text-lg">No slots available</p>
        <p className="text-gray-400 text-sm">
          Add your first slot to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-4 px-4 text-gray-600 font-semibold">
              Slot Number
            </th>
            <th className="text-left py-4 px-4 text-gray-600 font-semibold">
              Status
            </th>
            <th className="text-left py-4 px-4 text-gray-600 font-semibold">
              Booked By
            </th>
            <th className="text-right py-4 px-4 text-gray-600 font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {/* eslint-disable @typescript-eslint/no-explicit-any */}
          {slots.map((slot: any) => (
            <tr
              key={slot._id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      slot.status === "available"
                        ? "bg-green-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="font-semibold text-gray-800 text-lg">
                    #{slot.slotNumber}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    slot.status === "available"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {slot.status === "available" ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                </span>
              </td>
              <td className="py-4 px-4">
                {slot.bookedBy ? (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium">
                      {slot.bookedBy}
                    </span>
                    {slot.bookedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(slot.bookedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">-</span>
                )}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  {/* Edit Form */}
                  <form
                    action={async (formData) => {
                      "use server";
                      const newNumber = Number(formData.get("slotNumber"));
                      const result = await updateSlot(slot._id, newNumber);

                      if (result.success) {
                        revalidatePath("/dashboard");
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="number"
                      name="slotNumber"
                      defaultValue={slot.slotNumber}
                      min="1"
                      required
                      className="w-24 border-2 border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-105"
                      title="Update slot number"
                    >
                      <Edit size={18} />
                    </button>
                  </form>

                  {/* Delete Form */}
                  <form
                    action={async () => {
                      "use server";
                      const result = await deleteSlot(slot._id);

                      if (result.success) {
                        revalidatePath("/dashboard");
                      }
                    }}
                  >
                    <button
                      type="submit"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-105"
                      title="Delete slot"
                    >
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 🎯 Main Admin Page Component
export default async function AdminSlotsPage() {
  const handleAddSlot = async (formData: FormData): Promise<void> => {
    "use server";
    await addSlot(formData);
    revalidatePath("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <ParkingCircle className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Slot Management Dashboard
          </h1>
          <p className="text-gray-600">
            Manage parking slots with real-time updates
          </p>
        </div>

        {/* Stats Cards with Suspense */}
        <Suspense fallback={<StatsLoadingSkeleton />}>
          <StatsCards />
        </Suspense>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Add Slot Section */}
          <div className=" p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus size={24} />
              Add New Slot
            </h2>
            <form
              action={handleAddSlot}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="number"
                name="slotNumber"
                placeholder="Enter slot number (e.g., 101)"
                min="1"
                required
                className="flex-1 px-4 py-3 rounded-lg border-2 border-green-500 focus:border-gray-500 focus:ring-2 focus:ring-white outline-none transition-all text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap hover:scale-105"
              >
                <Plus size={20} />
                Add Slot
              </button>
            </form>
          </div>

          {/* Slots Table with Suspense */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">All Slots</h2>
              <div className="text-sm text-gray-500">
                Auto-refreshes with cached data
              </div>
            </div>

            <Suspense fallback={<TableLoadingSkeleton />}>
              <SlotsTable />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
