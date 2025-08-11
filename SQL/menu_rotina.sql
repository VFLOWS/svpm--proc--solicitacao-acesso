SELECT TOP 10
        RTRIM(MNUMENU.M_NAME)     MENU_NOME,
        MNUMENU.M_ARQMENU         MENU_ARQUIVO,
        MNUITEM.I_MODULE,
        RTRIM(MNUFUNC.F_FUNCTION) ROTINA,
        RTRIM(MNUI18N.N_DESC)     DESC_ROTINA,
        CASE
                WHEN MNUITEM.I_STATUS = '1'
                  THEN
                  'Habilitado'
                WHEN MNUITEM.I_STATUS = '2'
                  THEN
                  'Desabilitado'
                WHEN MNUITEM.I_STATUS = '3'
                  THEN
                  'Inibido'
        END                       AS 'Status',
        MNUITEM.I_ORDER           ORDEM,
        RTRIM(I18NPAI.N_DESC)     MENU_PAI,
        MNUI18N.N_DEFAULT         PADRAO_CUSTOM
FROM
        MPMENU_FUNCTION MNUFUNC
    JOIN
      MPMENU_ITEM MNUITEM
        ON MNUITEM.D_E_L_E_T_ = ' '
          AND MNUITEM.I_ID_FUNC = MNUFUNC.F_ID
    JOIN
      MPMENU_MENU MNUMENU
        ON MNUMENU.D_E_L_E_T_ = ' '
          AND MNUMENU.M_ID = I_ID_MENU
          AND MNUMENU.M_NAME NOT LIKE '#BKP_%'
    JOIN
      MPMENU_I18N I18NPAI
        ON I18NPAI.D_E_L_E_T_ = ' '
          AND I18NPAI.N_LANG = 1
          AND I18NPAI.N_PAREN_ID = MNUITEM.I_FATHER
    JOIN
      MPMENU_I18N MNUI18N
        ON MNUI18N.D_E_L_E_T_ = ' '
          AND MNUI18N.N_LANG = 1
          AND MNUI18N.N_PAREN_ID = MNUITEM.I_ID
WHERE
        MNUFUNC.D_E_L_E_T_ = ' '
GROUP BY
        MNUMENU.M_NAME,
        MNUITEM.I_MODULE,
        MNUFUNC.F_FUNCTION,
        MNUITEM.I_ORDER,
        MNUITEM.I_STATUS,
        MNUI18N.N_DESC,
        I18NPAI.N_DESC,
        MNUI18N.N_DEFAULT,
        MNUMENU.M_ARQMENU
ORDER BY
        1
