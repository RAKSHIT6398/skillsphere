import api from "../api/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function PayButton({ gigId, milestoneIndex }) {
  const { user } = useSelector((s) => s.auth);
  const pay = async () => {
    try {
      const { data } = await api.post("/payments/create-order", { gigId, milestoneIndex });
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "SkillSphere Escrow",
        order_id: data.order.id,
        prefill: { name: user.name, email: user.email },
        handler: async (res) => {
          await api.post("/payments/verify", { ...res, paymentId: data.paymentId });
          toast.success("Payment escrowed! 💰");
          window.location.reload();
        },
      });
      rzp.open();
    } catch (e) { toast.error(e.response?.data?.message || "Payment failed"); }
  };
  return <button onClick={pay} className="btn-primary !py-1 text-sm">Pay to Escrow</button>;
}