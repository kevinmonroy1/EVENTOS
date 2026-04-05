import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel administrativo</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Desde aquí administraremos los eventos.</p>
      </CardContent>
    </Card>
  );
}