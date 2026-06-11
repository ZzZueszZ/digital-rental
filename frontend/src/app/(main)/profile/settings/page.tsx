"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthSession } from "@/components/auth/Guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

function PasswordField({
  id,
  label,
  value,
  placeholder,
  visible,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-normal text-zinc-600">
        {label}
      </label>
      <div className="grid h-11 grid-cols-[minmax(0,1fr)_42px] overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors focus-within:border-zinc-300">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={
            id === "current-password" ? "current-password" : "new-password"
          }
          className="h-full min-w-0 rounded-none border-0 bg-transparent px-3 text-sm text-zinc-900 focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="flex h-full w-full items-center justify-center border-l border-zinc-100 bg-white text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;

  const responseData = error.response?.data as
    | { message?: string; error?: string }
    | undefined;
  return responseData?.message || responseData?.error || fallback;
};

export default function SettingsPage() {
  const { user, logout } = useAuthSession({ redirectToLogin: true });
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangeEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();

    if (!nextEmail) {
      toast.error("Vui lòng nhập email mới");
      return;
    }
    if (nextEmail === user?.email?.toLowerCase()) {
      toast.error("Email mới phải khác email hiện tại");
      return;
    }

    try {
      setIsChangingEmail(true);
      await authService.changeEmail({ newEmail: nextEmail });
      toast.success("Đã gửi email kích hoạt đến địa chỉ mới");
      await logout();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể thay đổi email"));
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu chưa khớp");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Đổi mật khẩu thành công");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể thay đổi mật khẩu"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              Bảo mật tài khoản
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-zinc-500">
              Quản lý email đăng nhập và mật khẩu. Các yêu cầu này được bảo vệ
              bởi lớp mã hóa E2EE của hệ thống.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-700">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-zinc-950">
                Đổi mật khẩu
              </h3>
              <p className="mt-1 text-xs font-normal leading-5 text-zinc-400">
                Mật khẩu mới cần tối thiểu 6 ký tự.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordField
              id="current-password"
              label="Mật khẩu hiện tại"
              value={currentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((value) => !value)}
              onChange={setCurrentPassword}
            />
            <PasswordField
              id="new-password"
              label="Mật khẩu mới"
              value={newPassword}
              placeholder="Tối thiểu 6 ký tự"
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((value) => !value)}
              onChange={setNewPassword}
            />
            <PasswordField
              id="confirm-password"
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
              onChange={setConfirmPassword}
            />

            <Button
              type="submit"
              disabled={isChangingPassword}
              className="mt-2 h-11 w-full rounded-xl bg-zinc-950 text-sm font-medium text-white shadow-none hover:bg-zinc-800"
            >
              {isChangingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Cập nhật mật khẩu
                </>
              )}
            </Button>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-700">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-zinc-950">
                Đổi email đăng nhập
              </h3>
              <p className="mt-1 text-xs font-normal leading-5 text-zinc-400">
                Email hiện tại: {user?.email || "Đang tải..."}
              </p>
            </div>
          </div>

          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="new-email"
                className="text-sm font-normal text-zinc-600"
              >
                Email mới
              </label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email-moi@example.com"
                autoComplete="email"
                className="h-11 border-zinc-200 bg-white px-3 text-sm text-zinc-900"
              />
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="text-xs font-normal leading-5 text-amber-900">
                Sau khi đổi email, tài khoản chuyển sang chờ kích hoạt. Bạn sẽ
                được đăng xuất và cần mở liên kết gửi đến email mới trước khi
                đăng nhập lại.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isChangingEmail}
              className="h-11 w-full rounded-xl bg-red-600 text-sm font-medium text-white shadow-none hover:bg-red-700"
            >
              {isChangingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi email xác minh
                </>
              )}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
