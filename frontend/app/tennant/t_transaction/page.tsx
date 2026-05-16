"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	formatCurrency,
	formatOrderDate,
	getPurchaseOrders,
	getStatusBadgeClass,
	getStatusLabel,
	isAcceptedOrderStatus,
	safeImageSrc,
	shouldUseNativeImage,
	loadPurchaseOrders,
} from "@/lib";
import { updatePurchaseOrderStatusOnAPI } from "@/fetch/purchase-orders";

export default function TennantTransactions() {
	const [ordersVersion, setOrdersVersion] = useState(0);
	const [isUpdating, setIsUpdating] = useState(false);
	const [openOrderId, setOpenOrderId] = useState("");
	const [statusById, setStatusById] = useState<Record<string, string>>({});
	const hasInitializedOpenOrderRef = useRef(false);

	useEffect(() => {
		void (async () => {
			await loadPurchaseOrders();
			setOrdersVersion((current) => current + 1);
		})();
	}, []);

	const orders = useMemo(
		() =>
			getPurchaseOrders().map((order) => ({
				...order,
				date: formatOrderDate(order.order_date),
				shippingAddress: order.shipping_address,
			})),
		[ordersVersion],
	);

	useEffect(() => {
			if (!hasInitializedOpenOrderRef.current && orders[0]?.id) {
			setOpenOrderId(orders[0].id);
				hasInitializedOpenOrderRef.current = true;
		}

		setStatusById(Object.fromEntries(orders.map((order) => [order.id, order.status])));
		}, [orders]);

	const setStatus = async (orderId: string, nextStatus: "shipped" | "cancelled") => {
		if (isUpdating) return;

		const order = orders.find((entry) => entry.id === orderId);
		if (!order) return;

		setIsUpdating(true);
		const updated = await updatePurchaseOrderStatusOnAPI(order.po_id, nextStatus);
		setIsUpdating(false);

		if (!updated) return;

		setStatusById((current) => ({
			...current,
			[orderId]: updated.status,
		}));

		await loadPurchaseOrders();
		setOrdersVersion((current) => current + 1);
	};

	return (
		<main className="w-full">
			<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex flex-col gap-4">
					{orders.map((order) => {
						const isOpen = openOrderId === order.id;
						const currentStatus = statusById[order.id] ?? order.status;
						const normalizedStatus = currentStatus.toLowerCase();
						const isAccepted = isAcceptedOrderStatus(currentStatus);
						const isLocked = isAccepted || normalizedStatus === "cancelled";
						const customerImage = safeImageSrc(order.customerImage) || "/product-placeholder.jpg";
						const useNativeCustomerImage = shouldUseNativeImage(customerImage);
						const customerName = order.customerName ?? order.name;

						return (
							<div key={order.id} className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
								<div
									role="button"
									tabIndex={0}
									onClick={() => setOpenOrderId(isOpen ? "" : order.id)}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											setOpenOrderId(isOpen ? "" : order.id);
										}
									}}
									className="w-full p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-start gap-4 min-w-0">
											<div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
													{useNativeCustomerImage ? (
														<img
															src={customerImage}
															alt={customerName}
															className="h-full w-full object-cover"
														/>
													) : (
														<Image
															src={customerImage}
															alt={customerName}
															fill
															className="object-cover"
														/>
													)}
											</div>

											<div className="min-w-0">
												<p className="text-lg font-bold text-gray-900 truncate">{order.name}</p>
												<p className="text-sm text-gray-600 mt-1">{order.date}</p>
												<p className="text-sm text-gray-500 mt-1 truncate">Address: {order.shippingAddress}</p>
												<Link
													href={`/system/transaction-details?id=${order.po_id}`}
													onClick={(event) => event.stopPropagation()}
													className="inline-block mt-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
												>
													Details
												</Link>
											</div>
										</div>

										<div className="flex flex-col items-end gap-2 flex-shrink-0">
											<span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(currentStatus)}`}>
												{getStatusLabel(currentStatus)}
											</span>
											<p className={`text-xs font-semibold ${isAccepted ? "text-emerald-700" : "text-gray-600"}`}>
												{isAccepted ? "Accepted" : "Not accepted"}
											</p>
											<span className="text-gray-400 text-sm">{isOpen ? "Hide" : "Show"}</span>
										</div>
									</div>
								</div>

								<div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
									<div className="overflow-hidden">
										<div className="border-t border-gray-200 p-4 sm:p-5 bg-gray-50">
											<div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
												<div>
													<p className="text-sm font-semibold text-gray-900">PO decision</p>
													<p className="text-xs text-gray-600">
														{isLocked ? "This PO is locked." : "Accept sets On the way. Reject sets Cancelled."}
													</p>
												</div>

												<div className="flex items-center gap-2">
													<button
														type="button"
														onClick={() => void setStatus(order.id, "cancelled")}
														disabled={isLocked || isUpdating}
														className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-500"
													>
														Reject
													</button>
													<button
														type="button"
														onClick={() => void setStatus(order.id, "shipped")}
														disabled={isLocked || isUpdating}
														className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors bg-teal-600 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
													>
														Accept
													</button>
												</div>
											</div>

											<div className="grid grid-cols-1 gap-4">
												{order.items.map((item) => (
													<div
														key={item.id}
														className="grid grid-cols-[72px_1fr_auto] gap-4 items-center rounded-lg border border-gray-200 bg-white p-3"
													>
														<div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
															<Image src={item.image} alt={item.name} fill className="object-cover" />
														</div>

														<div className="min-w-0">
															<p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
															<p className="text-sm text-gray-600 mt-1">Qty: {item.quantity} {item.unitLabel}</p>
														</div>

														<div className="text-right">
															<p className="text-sm font-semibold text-gray-500">Price</p>
															<p className="text-base font-bold text-gray-900">Rp{formatCurrency(item.price * item.quantity)}</p>
														</div>
													</div>
												))}
											</div>

										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</main>
	);
}
